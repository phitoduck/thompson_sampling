from scipy.stats import binom
from scipy.stats import beta
from timeit import default_timer as time
import matplotlib.pyplot as plt
import numpy as np

class Bandits:
    def __init__(self, probabilities, payouts):
        self.__dict__.update(locals())
        
        self.arms = len(self.payouts)
        
        self.total_winnings = 0 
        self.num_machines = len(self.probabilities)
        self.states = np.ones((self.num_machines, 2), dtype=int) # each row is (a_i, b_i) for a machine
        
    def pull(self, i, num_pulls=1):
        """
        Simulate a single pull on the i'th arm. 
        
        @params:
            i              (int): which arm to pull
            num_pulls      (int): how many times the arm is pulled
        @return
            (Δa_i, Δb_i) (tuple): (num wins, num losses)
        """
        
        J_i = self.payouts[i]           # expected reward of the i'th arm
        theta_i = self.probabilities[i] # probability of the i'th arm
    
        # draw a sample of size 1 from a binomial distribution
        # where n = 1 (which is a draw from the bernoulli distribution)
        outcome = binom.rvs(n=1, p=theta_i, size=num_pulls)
        
        num_wins = np.sum(outcome)
        num_losses = num_pulls - num_wins
        winnings = num_wins * J_i
        
        # update class data
        self.states[i, 0] += num_wins
        self.states[i, 1] += num_losses
        self.total_winnings += winnings
        
        return J_i * num_wins, (num_wins, num_losses) # (win, loss)
    
    def get_estimated_probabilities(self):
        """
        @return (ndarray): vector of estimated probabilities based on current states
        """
        probs = self.states[:, 0].copy() / np.sum(self.states, axis=1)
        return probs
    
    def compute_R(self, M, r, beta):
        """
        Given an r and M, this computes all of the values of R(a, b, r)
        for 0 ≤ a ≤ M and 0 ≤ b ≤ M, where 1 ≤ a + b ≤ M.
        
        @params
            r    (float): number between 0 and 1 denoting the Bernoulli parameter of a simple machine
            M      (int): total number of pulls
            beta (float): discount factor to incentivize making money sooner
        @return
            R_values (ndarray): (M + 1) × (M + 1) array of optimal values where the (a, b)'th entry
                gives the optimal value for R(a, b, r)
            
        """
        
        R_values = np.zeros((M + 1, M + 1))
        
        # 1. solve the cases where a + b = M (meaning we are doing the last pull)
        for a in range(M + 1): 
            b = M - a
            R_values[a, b] = (1 / (1 - beta)) * max(a / (a + b), r)
            
        # 2. solve for the rest of the entries using bottom up dynamic programming
        #    by solving for R[a, b] such that R[a+1, b] and R[a, b+1] is already solved for
        m = M - 1
        while m >= 1:
            for a in range(m + 1): 
                b = m - a
                R_values[a, b] = max(
                    (a / (a + b))*(1 + beta*R_values[a + 1, b]) + (b / (a + b))*beta*R_values[a, b + 1],
                    r / (1 - beta)
                )
            m -= 1
            
        return R_values
    
    def gittens(self, J, states, M, K, beta=0.9):
        """
        Compute the gittens index of each of the arms associated with the given payouts and states
        
        @params
            J      (ndarray): array of payout values for each arm
            states (ndarray): (n × 2) array where the i'th row is the state (a_i, b_i) of the i'th arm
            M          (int): number of times to pull
            K          (int): number of values of r to compute
            beta     (float): discount factor
            
        @return
            gittens_indices (ndarray): array where the i'th entry is the gittens index of the i'th arm
        """
        
        # 1. Compute the R_values (M + 1) × (M + 1) for each r value
        r_values = np.arange(K) / (K - 1)
        R_values = np.zeros((K, M + 1, M + 1))
        for k, r in enumerate(r_values):
            R_values[k] = self.compute_R(M, r, beta)
                
        def nu(a, b):
            """
            computes the r-value that makes the gittens formula the most true
            """
            
            gittens_values = np.zeros(K)
            
            # compute all gittens values for (a, b)
            for k in range(K): # look at the k'th submatrix of our 3d array of R-values                
                gittens_value = (a*(1-beta)/(a+b))*(1+beta*R_values[k, a + 1, b]) + \
                                (b*(1-beta)/(a+b))*beta*R_values[k, a, b + 1]
                gittens_values[k] = ( abs(gittens_value - r_values[k]) )

            minimizer = np.argmin(gittens_values)
            gittens_r = r_values[minimizer]
            
            return gittens_r
            
        # 2. compute gittens indices for each machine using the R_values
        num_machines = len(J)
        gittens_indices = np.zeros(num_machines)
        for i in range(num_machines):
            state = states[i, :]
            a_i = state[0] # get num wins for i'th machine
            b_i = state[1] # get num losses for i'th machine
            gittens_indices[i] = J[i] * nu(a_i, b_i) 
                
        return gittens_indices
    
    def thompson(self, states=None):
        """
        Given an array of states, return a vector of bernoulli samples from the beta 
        distribution corresponding to each state
        
        @params
            states (ndarray): (n × 2) array where the i'th row is the state (a_i, b_i) of the i'th arm
            
        @returns (int): argmax of vector where the i'th entry is the bernoulli parameter drawn from the i'th 
            state
        """
        
        if states is None:
            states = self.states

        # sample from each state
        bernoullis = np.zeros(len(states))
        for index, state in enumerate(states):
            a, b = state
            theta = beta.rvs(a, b, size=1)
            bernoullis[index] = theta
                
        return np.argmax(bernoullis)
        
        
        
    
def run_gittens(probabilities, payouts, K, T, M, beta=0.9):
    """
        Pull and update T times using the gittens index algorithm.
        
        @return 
            (ndarray): array of estimated parameters for each machine
                (int): number of dollars won
    """
    
    # init a bandit problem
    bandit = Bandits(probabilities, payouts)
    
    # pull an arm T times
    for _ in range(T):
        
        # calculate the gittens indices
        gittens_indices = bandit.gittens(J=bandit.payouts, states=bandit.states, M=M, K=K, beta=beta)
        
        # get the max gittens index
        max_index = np.argmax(gittens_indices)
        
        # pull the arm
        bandit.pull(max_index)
        
    return bandit.get_estimated_probabilities(), bandit.total_winnings


def run_thompson(probabilities, payouts, T):
    """
        Pull and update T times using the Thompson sampling algorithm
        
        @return 
            (ndarray): array of estimated parameters for each machine
                (int): number of dollars won
    """
    
    # init a bandit problem
    bandit = Bandits(probabilities, payouts)
    
    # pull and update T times
    for _ in range(T):
        machine_index = bandit.thompson()
        bandit.pull(machine_index)
    
    return bandit.get_estimated_probabilities(), bandit.total_winnings


def compare_thompson_to_gittens(probabilities=np.array([0.2, 0.5, 0.7]), payouts=np.array([1, 1, 1]), T=100):
    
    thompson_times = list()
    gittens_times = list()
    
    num_machines = len(probabilities)
    
    # time gittens
    gittens_avg_probs = np.zeros(num_machines)
    gittens_avg_winnings = 0
    gittens_payouts = list()
    for t in range(T):
        start = time()
        gittens_probs, gittens_money = run_gittens(probabilities=probabilities, payouts=payouts, M=t+1, K=99, T=t)
        gittens_avg_probs += gittens_probs
        gittens_avg_winnings += gittens_money
        gittens_payouts.append(gittens_money)
        gittens_times.append(time() - start)
    
    # time thompson
    thompson_avg_probs = np.zeros(num_machines)
    thompson_avg_winnings = 0
    thompson_payouts = list()
    for t in range(T):
        start = time()
        thompson_probs, thompson_money = run_thompson(probabilities=probabilities, payouts=payouts, T=t)
        thompson_avg_probs += thompson_probs
        thompson_avg_winnings += thompson_money
        thompson_payouts.append(thompson_money)
        thompson_times.append(time() - start)
        
    # compute average winnings and probabilities
    gittens_avg_time = np.average(gittens_times)
    gittens_avg_probs /= T
    gittens_avg_winnings /= T
    thompson_avg_time = np.average(thompson_times)
    thompson_avg_probs /= T
    thompson_avg_winnings /= T
    
    # plot the data to compare the two methods
    domain = np.arange(T)
    
    fig, axes = plt.subplots(2, 1)
    fig.suptitle("Thompson vs. Gittens Algorithm")
    
    axes[0].set_title("Number of Pulls vs. Time")
    axes[0].plot(domain, gittens_times, label="Gittens")
    axes[0].plot(domain, thompson_times, label="Thompson")
    axes[0].set_ylabel("Seconds")
    axes[0].set_xlabel("Number of Pulls")
    axes[0].legend()
    
    axes[1].set_title("Number of Pulls vs Payout")
    axes[1].plot(domain, gittens_payouts, label="Gittens")
    axes[1].plot(domain, thompson_payouts, label="Thompson")
    axes[1].set_ylabel("Total Payout ($)")
    axes[1].set_xlabel("Number of Pulls")
    axes[1].legend()
    plt.show()
    
    return (gittens_avg_time, gittens_avg_probs, gittens_avg_winnings), \
         (thompson_avg_time, thompson_avg_probs, thompson_avg_winnings)
    
    
        
        
        
        
        