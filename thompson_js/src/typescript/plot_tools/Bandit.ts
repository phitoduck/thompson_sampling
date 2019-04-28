import { Tuple } from './DataModels';
var jStat = require('jStat').jStat;

/**
 * Model for a Bernoulli bandit
 */
export class Bandit {

    public state: Tuple;
    public name: string;
    public color: string;
    public image: string;

    /**
     * @param initialWins number of wins starting out
     * @param initialLosses number of losses starting out
     * @param name name of bandit
     */
    constructor(initialWins: number, 
        initialLosses: number, name: string, 
        color: string, image: string) {
        this.state = new Tuple(initialWins, initialLosses);
        this.name = name;
        this.color = color;
        this.image = image;
    }

    /**
     * Update state of bandit
     * @param deltaWins number of wins to add to state
     * @param deltaLosses number of losses to add to state
     */
    addToState(deltaWins: number, deltaLosses: number) {
        let delta = new Tuple(deltaWins, deltaLosses);
        this.state.add(delta);
    }

    /**
     * Get an array of values for the pdf of the Beta(a, b) in order to plot it
     * 
     * @param num_points number of points to sample in the range [0, 1]
     */
    public computeBetaLineData(num_points: number): Array<Tuple> {

        let linspace: Array<number> = [];
        for (let i = 0; i <= num_points; i++) {
            linspace.push(i / num_points);
        }

        let beta_data: Array<Tuple> = [];
        linspace.forEach(x => beta_data.push(
            new Tuple(x, jStat.beta.pdf(x, this.state.x, this.state.y)
        )))
        
        return beta_data;
    }

    /**
     * Draw a random sample from the beta distribution of this Bandit
     * @return a number between 0 and 1
     */
    public sample(): number {
        return jStat.beta.sample(this.state.x, this.state.y);
    }

}