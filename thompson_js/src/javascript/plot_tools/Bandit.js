"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataModels_1 = require("./DataModels");
var jStat = require('jStat').jStat;
/**
 * Model for a Bernoulli bandit
 */
var Bandit = /** @class */ (function () {
    /**
     * @param initialWins number of wins starting out
     * @param initialLosses number of losses starting out
     * @param name name of bandit
     */
    function Bandit(initialWins, initialLosses, name, color, image) {
        this.state = new DataModels_1.Tuple(initialWins, initialLosses);
        this.name = name;
        this.color = color;
        this.image = image;
    }
    /**
     * Update state of bandit
     * @param deltaWins number of wins to add to state
     * @param deltaLosses number of losses to add to state
     */
    Bandit.prototype.addToState = function (deltaWins, deltaLosses) {
        var delta = new DataModels_1.Tuple(deltaWins, deltaLosses);
        this.state.add(delta);
    };
    /**
     * Get an array of values for the pdf of the Beta(a, b) in order to plot it
     *
     * @param num_points number of points to sample in the range [0, 1]
     */
    Bandit.prototype.computeBetaLineData = function (num_points) {
        var _this = this;
        var linspace = [];
        for (var i = 0; i <= num_points; i++) {
            linspace.push(i / num_points);
        }
        var beta_data = [];
        linspace.forEach(function (x) { return beta_data.push(new DataModels_1.Tuple(x, jStat.beta.pdf(x, _this.state.x, _this.state.y))); });
        return beta_data;
    };
    /**
     * Draw a random sample from the beta distribution of this Bandit
     * @return a number between 0 and 1
     */
    Bandit.prototype.sample = function () {
        return jStat.beta.sample(this.state.x, this.state.y);
    };
    return Bandit;
}());
exports.Bandit = Bandit;
//# sourceMappingURL=Bandit.js.map