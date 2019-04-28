import { ThompsonBandits } from './plot_tools/ThompsonPlot';
import { Tuple } from './plot_tools/DataModels';
import * as $ from 'jquery';
import { Bandit } from './plot_tools/Bandit';

window.onload = function() {

    // note: image paths must be relative to index.html
    var bandits = [
        new Bandit(1, 1, 'Cute Cat', 'green', './src/images/cute-cat.jpg'),
        new Bandit(1, 1, 'Weird Cat', 'red', './src/images/weird-cat.jpg'),
        new Bandit(1, 1, 'Wet Cat', 'blue', './src/images/wet-cat.jpg')
    ]

    var svg_id = '#visualization'
    var svg_width = 700;
    var svg_height = 380;
    var thompsonBandits = new ThompsonBandits(bandits, svg_width, svg_height, svg_id);

    // update thompson on click
    $('#sample-button').click(() => {

        // choose the bandit to sample from
        let banditIndex = thompsonBandits.getBanditChoice();
        
        // initiate sampling process and dialog
        let dialogElementId = '#dialog';
        let grayoutElementId = '#cover';
        thompsonBandits.setupSampleDialog(
            dialogElementId, 
            grayoutElementId,
            banditIndex);

    });

    // reset all the bandits
    $('#reset-button').click(() => { 
        thompsonBandits.reset();
    });

}
