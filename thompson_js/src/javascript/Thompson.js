"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ThompsonPlot_1 = require("./plot_tools/ThompsonPlot");
var $ = require("jquery");
var Bandit_1 = require("./plot_tools/Bandit");
window.onload = function () {
    // note: image paths must be relative to index.html
    var bandits = [
        new Bandit_1.Bandit(1, 1, 'Cute Cat', 'green', './src/images/cute-cat.jpg'),
        new Bandit_1.Bandit(1, 1, 'Weird Cat', 'red', './src/images/weird-cat.jpg'),
        new Bandit_1.Bandit(1, 1, 'Wet Cat', 'blue', './src/images/wet-cat.jpg')
    ];
    var svg_id = '#visualization';
    var svg_width = 700;
    var svg_height = 380;
    var thompsonBandits = new ThompsonPlot_1.ThompsonBandits(bandits, svg_width, svg_height, svg_id);
    // update thompson on click
    $('#sample-button').click(function () {
        // choose the bandit to sample from
        var banditIndex = thompsonBandits.getBanditChoice();
        // initiate sampling process and dialog
        var dialogElementId = '#dialog';
        var grayoutElementId = '#cover';
        thompsonBandits.setupSampleDialog(dialogElementId, grayoutElementId, banditIndex);
    });
    // reset all the bandits
    $('#reset-button').click(function () {
        thompsonBandits.reset();
    });
};
//# sourceMappingURL=Thompson.js.map