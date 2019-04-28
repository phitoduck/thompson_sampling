"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LinePlot_1 = require("./LinePlot");
var DataModels_1 = require("./DataModels");
var Line_1 = require("./Line");
var ThompsonBandits = /** @class */ (function () {
    function ThompsonBandits(bandits, svg_width, svg_height, svg_id) {
        // init bandits and bandit lines
        this.bandits = bandits;
        this.updateBanditLines();
        // init linePlot
        this.linePlot = new LinePlot_1.LinePlot(this.banditLines, svg_width, svg_height, svg_id);
        // plot
        this.plot();
    }
    /**
     * Plot the current state of the multi arm bandit problem
     */
    ThompsonBandits.prototype.plot = function () {
        var _this = this;
        var _a;
        // plot lines and legend
        (_a = this.linePlot).create_plot.apply(_a, this.banditLines);
        this.banditLines.forEach(function (line) {
            _this.linePlot.plot_line(line);
        });
        this.linePlot.create_legend();
        this.linePlot.setYLabel("Likelihood");
    };
    /**
     * Recompute the line data for each of the bandits based on their
     * current states
     *
     * @param showAsDecimal: boolean - show decimal places
     */
    ThompsonBandits.prototype.updateBanditLines = function (showAsDecimal) {
        if (showAsDecimal === void 0) { showAsDecimal = false; }
        // compute a line object for each bandit
        this.banditLines = this.bandits.map(function (bandit) {
            var lineData = bandit.computeBetaLineData(ThompsonBandits.NUM_POINTS);
            // format the numbers
            var adopted = bandit.state.x - 1; // 2 decimal plages
            var left = bandit.state.y - 1; // 2 decimal plages
            if (showAsDecimal) {
                adopted = adopted.toFixed(2);
                left = left.toFixed(2);
            }
            var title = bandit.name + '\t (' + adopted + ' adopted, ' + left + ' left)';
            return new Line_1.Line(lineData, title, bandit.color);
        });
    };
    /**
     * update all bandits from old state to new state in the same amount of time
     * @param changingIndices which bandits will be modified (with the corresponding delta)
     * @param banditDeltas Tuples of the form { delta_wins, delta_losses } for the bandits to be changed
     */
    ThompsonBandits.prototype.updateBanditsAnimate = function (changingIndices, banditDeltas, delta) {
        var _this = this;
        if (delta === void 0) { delta = 0.01; }
        var sum = 0;
        var interval = setInterval(function () {
            // keep track of how many times loop has gone
            sum += delta;
            // update the changing bandits' states
            for (var i = 0; i < _this.bandits.length; i++) {
                // add delta * banditDelta to the changing bandit states
                if (changingIndices.includes(i)) {
                    // change this bandit by it's delta
                    var bandit = _this.bandits[i];
                    var banditDelta = banditDeltas[changingIndices.indexOf(i)];
                    bandit.state.add(banditDelta.times(delta));
                }
            }
            // update bandit lines
            _this.updateBanditLines(true);
            // finish updating?
            if (sum >= 1) {
                // stop updating
                clearInterval(interval);
                // round the bandit states to integers
                _this.bandits.forEach(function (bandit) {
                    var state = bandit.state;
                    var newState = new DataModels_1.Tuple(Math.round(state.x), Math.round(state.y));
                    bandit.state = newState;
                });
                _this.updateBanditLines(false);
            }
            // plot
            _this.plot();
        }, 10);
    };
    /**
     * Reset all bandit states to (1 win, 1 loss)
     */
    ThompsonBandits.prototype.reset = function () {
        // compute deltas and indices
        var banditIndices = new Array();
        var banditDeltas = this.bandits.map(function (bandit, index) {
            banditIndices.push(index); // save bandit index
            var state = bandit.state;
            return new DataModels_1.Tuple(-(state.x) + 1, -(state.y) + 1);
        });
        // make changes
        this.updateBanditsAnimate(banditIndices, banditDeltas, .01);
    };
    /**
     * Take a random sample from each bandit distribution
     * return the index of the highest sample
     *
     * @return argmax (index) of the bandit chosen to be pulled next
     */
    ThompsonBandits.prototype.getBanditChoice = function () {
        // sample from each bandit
        var samples = [];
        this.bandits.forEach(function (bandit) {
            samples.push(bandit.sample());
        });
        // get the bandit with the highest sample
        var argmax = samples.indexOf(Math.max.apply(Math, samples));
        return argmax;
    };
    /**
     * Update the state of one of the bandits
     *
     * @param banditIndex index of bandit whose state is to be updated
     * @param isPayout true if the bandit paid out, false if the bandit did not
     */
    ThompsonBandits.prototype.pull = function (banditIndex, isPayout) {
        // prepare bandit delta
        var win = new DataModels_1.Tuple(1, 0);
        var loss = new DataModels_1.Tuple(0, 1);
        var banditDelta = isPayout ? win : loss;
        // update the bandit with animation
        this.updateBanditsAnimate([banditIndex], [banditDelta]);
    };
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
    ThompsonBandits.prototype.setupSampleDialog = function (dialogElementId, grayoutElementId, banditIndex) {
        var _this = this;
        // get the bandit to be displayed
        var bandit = this.bandits[banditIndex];
        // gray out the screen
        $('#cover').css({
            display: 'block'
        });
        var image = new Image();
        image.src = bandit.image;
        image.onload = function () {
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
        };
        // ensure cover fills the whole screen
        if (document.body.style.overflow === "hidden") {
            $(grayoutElementId).css({
                'width': $(document).width() + 'px',
                'height': $(document).height() + 'px'
            });
        }
        // create success and failure buttons
        $(dialogElementId).append("\n            <div id=\"thmpsn-popup-content\" class=\"container-fluid\">\n                <div class='row align-items-start justify-content-center'>\n                    <h2 id=\"thmpsn-dialog-header\">Game of Homes Animal Shelter</h2>\n                </div>\n                <div class='row align-items-end justify-content-start'>\n                    <button id='thmpsn-adopt-btn'>Adopt a Cat</button>\n                </div>\n                <div class=\"row align-items-end justify-content-start\">\n                    <button id=\"thmpsn-leave-btn\">Not Today...</button>\n                </div>\n            </div>\n        ");
        // define how to close the dialog
        function tearDownDialog() {
            // hide the popup and the cover
            $(grayoutElementId).css({ display: 'none' });
            $(dialogElementId).css({ display: 'none' });
            $(document).css({ overflowY: 'scroll' }); // show the overflow
            // delete the popup content from the html
            // (this is to avoid attaching the onclick functions
            //  more than once)
            $('#thmpsn-popup-content').remove();
        }
        // setup success button
        $('#thmpsn-adopt-btn').click(function () {
            // we won!
            _this.pull(banditIndex, true);
            tearDownDialog();
        });
        // setup failure button
        $('#thmpsn-leave-btn').click(function () {
            // we lost!
            _this.pull(banditIndex, false);
            tearDownDialog();
        });
    };
    ThompsonBandits.NUM_POINTS = 50;
    return ThompsonBandits;
}());
exports.ThompsonBandits = ThompsonBandits;
//# sourceMappingURL=ThompsonPlot.js.map