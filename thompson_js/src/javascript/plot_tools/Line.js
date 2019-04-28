"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a line that can be plotted in a LinePlot
 */
var Line = /** @class */ (function () {
    function Line(lineData, title, color) {
        this.d3Line = null; // reference to the d3Line object created when plotting
        this.lineData = lineData;
        this.title = title;
        this.color = color;
    }
    Line.prototype.setD3Line = function (d3Line) {
        this.d3Line = d3Line;
    };
    return Line;
}());
exports.Line = Line;
//# sourceMappingURL=Line.js.map