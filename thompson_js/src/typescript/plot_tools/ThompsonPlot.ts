import { LinePlot } from './LinePlot';
import { Tuple } from './DataModels';
import { Line } from './Line';
import { Bandit } from './Bandit';
import { image } from 'd3';

export class ThompsonBandits {

    public linePlot: LinePlot; // plot for rendering
    public bandits: Array<Bandit>; // bandits (contain states)
    private banditLines: Array<Line>;
    public static readonly NUM_POINTS = 50;

    constructor(bandits: Array<Bandit>,
        svg_width: number, svg_height: number, svg_id: string) {

        // init bandits and bandit lines
        this.bandits = bandits;
        this.updateBanditLines();

        // init linePlot
        this.linePlot = new LinePlot(this.banditLines, svg_width, svg_height, svg_id);

        // plot
        this.plot();

    }

    /**
     * Plot the current state of the multi arm bandit problem
     */
    public plot(): void {
        // plot lines and legend
        this.linePlot.create_plot(...this.banditLines);
        this.banditLines.forEach(line => {
            this.linePlot.plot_line(line);
        })
        this.linePlot.create_legend();
        this.linePlot.setYLabel("Likelihood")
    }

    /**
     * Recompute the line data for each of the bandits based on their
     * current states
     * 
     * @param showAsDecimal: boolean - show decimal places
     */
    public updateBanditLines(showAsDecimal: boolean = false): void {
        // compute a line object for each bandit
        this.banditLines = this.bandits.map(bandit => {
            let lineData = bandit.computeBetaLineData(ThompsonBandits.NUM_POINTS);

            // format the numbers
            let adopted: any = bandit.state.x - 1; // 2 decimal plages
            let left: any = bandit.state.y - 1; // 2 decimal plages
            if (showAsDecimal) {
                adopted = adopted.toFixed(2);
                left = left.toFixed(2);
            }

            let title = bandit.name + '\t (' + adopted + ' adopted, ' + left + ' left)';
            return new Line(lineData, title, bandit.color);
        });
    }

    /**
     * update all bandits from old state to new state in the same amount of time
     * @param changingIndices which bandits will be modified (with the corresponding delta)
     * @param banditDeltas Tuples of the form { delta_wins, delta_losses } for the bandits to be changed
     */
    public updateBanditsAnimate(changingIndices: Array<number>, banditDeltas: Array<Tuple>,
        delta = 0.01): void {

        let sum = 0;
        let interval = setInterval(() => {

            // keep track of how many times loop has gone
            sum += delta;

            // update the changing bandits' states
            for (let i = 0; i < this.bandits.length; i++) {
                // add delta * banditDelta to the changing bandit states
                if (changingIndices.includes(i)) {
                    // change this bandit by it's delta
                    let bandit = this.bandits[i];
                    let banditDelta = banditDeltas[changingIndices.indexOf(i)];
                    bandit.state.add(banditDelta.times(delta));
                }
            }

            // update bandit lines
            this.updateBanditLines(true);

            // finish updating?
            if (sum >= 1) {
                // stop updating
                clearInterval(interval);

                // round the bandit states to integers
                this.bandits.forEach(bandit => {
                    let state = bandit.state;
                    let newState: Tuple = new Tuple(Math.round(state.x), Math.round(state.y));
                    bandit.state = newState;
                })

                this.updateBanditLines(false);
            }

            // plot
            this.plot();

        }, 10)

    }

    /**
     * Reset all bandit states to (1 win, 1 loss)
     */
    public reset(): void {

        // compute deltas and indices
        let banditIndices: Array<number> = new Array<number>();
        let banditDeltas: Array <Tuple> = this.bandits.map((bandit, index) => {
            banditIndices.push(index); // save bandit index
            let state = bandit.state;
            return new Tuple(-(state.x) + 1, -(state.y) + 1);
        });

        // make changes
        this.updateBanditsAnimate(banditIndices, banditDeltas, .01);

    }

    /**
     * Take a random sample from each bandit distribution
     * return the index of the highest sample
     * 
     * @return argmax (index) of the bandit chosen to be pulled next
     */
    public getBanditChoice(): number {

        // sample from each bandit
        let samples: Array < number > = [];
        this.bandits.forEach(bandit => {
            samples.push(bandit.sample())
        });

        // get the bandit with the highest sample
        let argmax = samples.indexOf(Math.max(...samples));

        return argmax;

    }

    /**
     * Update the state of one of the bandits
     * 
     * @param banditIndex index of bandit whose state is to be updated
     * @param isPayout true if the bandit paid out, false if the bandit did not
     */
    public pull(banditIndex: number, isPayout: boolean): void {

        // prepare bandit delta
        let win: Tuple = new Tuple(1, 0);
        let loss: Tuple = new Tuple(0, 1);
        let banditDelta: Tuple = isPayout ? win : loss;

        // update the bandit with animation
        this.updateBanditsAnimate([banditIndex], [banditDelta])

    }

    /**
     * Bring up a sampling dialogue: 
     * 
     * ex) fill a popup element with the backround image of a cat associated 
     *     with a bandit.
     * 
     * @param dialogElementId css id of the element to use as a dialogue to display 
     *                        the sampler (ex: '#dialog')
     * @param grayoutElementId css id of element used to cover up page contents and
     *                         gray out screen for add
     * @param banditIndex index of bandit whose information is to be displayed
     */
    public setupSampleDialog(dialogElementId: string,
        grayoutElementId: string,
        banditIndex: number): void {

        // get the bandit to be displayed
        let bandit = this.bandits[banditIndex];

        // gray out the screen
        $('#cover').css({
            display: 'block'
        });

        let image = new Image();
        image.src = bandit.image;
        image.onload = function() {
            // overlay the dialog window in the center of the screen
            $('#dialog').css({
                display: 'block',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                'background-image': "url('" + bandit.image + "')",
                width: image.width + 'px'
            });
            // $('#image-container').css('background-image', "url('" + bandit.image + "')");
        }
        // ensure cover fills the whole screen
        if (document.body.style.overflow === "hidden") {
            $(grayoutElementId).css({
                'width': $(document).width() + 'px',
                'height': $(document).height() + 'px'
            });
        }

        // create success and failure buttons
        $(dialogElementId).append(`
            <div id="thmpsn-popup-content" class="container-fluid">
                <div class='row align-items-start justify-content-center'>
                    <h2 id="thmpsn-dialog-header">Game of Homes Animal Shelter</h2>
                </div>
                <div class='row align-items-end justify-content-start'>
                    <button id='thmpsn-adopt-btn'>Adopt a Cat</button>
                </div>
                <div class="row align-items-end justify-content-start">
                    <button id="thmpsn-leave-btn">Not Today...</button>
                </div>
            </div>
        `);

        // define how to close the dialog
        function tearDownDialog() {
            // hide the popup and the cover
            $(grayoutElementId).css({display: 'none'});
            $(dialogElementId).css({display: 'none'});
            $(document).css({overflowY: 'scroll'}); // show the overflow

            // delete the popup content from the html
            // (this is to avoid attaching the onclick functions
            //  more than once)
            $('#thmpsn-popup-content').remove();
        }

        // setup success button
        $('#thmpsn-adopt-btn').click(() => {
            // we won!
            this.pull(banditIndex, true);
            tearDownDialog();
        })

        // setup failure button
        $('#thmpsn-leave-btn').click(() => {
            // we lost!
            this.pull(banditIndex, false);
            tearDownDialog();
        })
    }

}