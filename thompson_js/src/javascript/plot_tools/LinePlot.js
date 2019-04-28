"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// for typescript and d3
// import * as _d3 from 'd3';
// declare global {
//     const d3: typeof _d3;
// }
var d3 = require('d3');
/**
 * A plot to be displayed on an <svg> html element using d3
 */
var LinePlot = /** @class */ (function () {
    function LinePlot(lines, width, height, svg_id) {
        this.xRange = null;
        this.yRange = null;
        // <svg> this.MARGINS
        this.MARGINS = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        };
        /**
         * Set up a figure to plot the given lines.
         * Save xRange, and yRange as class attributes.
         *
         * @param lines Arrays of tuples of points to plot
         */
        this.create_plot = function () {
            var lines = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                lines[_i] = arguments[_i];
            }
            // save the new lines
            this.lines = lines;
            // concatenate all of the lines
            var joined_lines = [];
            lines.forEach(function (line) {
                line.lineData.forEach(function (tuple) { return joined_lines.push(tuple); });
            });
            // get the <svg> element and erase existing content
            this.svg.selectAll('*').remove();
            // get bounds for x range
            this.xRange = d3.scaleLinear()
                .range([this.MARGINS.left, this.width - this.MARGINS.right])
                .domain([
                d3.min(joined_lines, function (d) { return d.x; }),
                d3.max(joined_lines, function (d) { return d.x; }) // upper x bound
            ]);
            // get bounds for y range
            this.yRange = d3.scaleLinear()
                .range([this.height - this.MARGINS.top, this.MARGINS.bottom])
                .domain([
                d3.min(joined_lines, function (d) { return d.y; }),
                d3.max(joined_lines, function (d) { return d.y; }) // upper y bound 
            ]);
            // get axes with the bounds
            var xAxis = d3.axisBottom(this.xRange)
                .scale(this.xRange)
                .tickSize(5);
            var yAxis = d3.axisLeft(this.yRange)
                .scale(this.yRange)
                .tickSize(5);
            // include the x axis
            this.svg.append('svg:g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + (this.height - this.MARGINS.bottom) + ')')
                .call(xAxis);
            // include the y axis
            this.svg.append('svg:g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + (this.MARGINS.left) + ',0)')
                .call(yAxis);
        };
        /**
         * Replace all lines with the new lines
         * corresponding to the new lineData
         *
         * NOTE: use this function for animations
         *
         * @param lines new lines
         * @param lineData
         */
        this.update_lines = function (lines) {
            var _this = this;
            // save these new lines
            this.lines = lines;
            // remove each line
            lines.forEach(function (line) { return line.d3Line.remove(); });
            // plot each line and save the d3line reference
            lines.forEach(function (line) {
                var d3line = _this.plot_line(line);
                line.setD3Line(d3line);
            });
        };
        this.lines = lines;
        this.width = width;
        this.height = height;
        this.svg = d3.select(svg_id);
    }
    /**
     * (UNTESTED!)
     *
     * Set the x-axis label
     * @param text label on x-axis
     */
    LinePlot.prototype.setXLabel = function (text) {
        // text label for the x axis
        this.svg.append("text")
            .attr("transform", "translate(" + (this.width / 2) + " ," +
            (this.height + this.MARGINS.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Date");
    };
    /**
     * Set the y-axis label
     * @param text label on y-axis
     */
    LinePlot.prototype.setYLabel = function (text) {
        var horizontal_offset = 2;
        // text label for the y axis
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", horizontal_offset) // set horizontal offset (since it is rotated, this is y)
            .attr("x", 0 - (this.height / 2)) // set vertical offset
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "22px")
            .style("font-weight", "450")
            .text(text);
    };
    /**
     * Add a legend to the svg
     *
     * @param svg <svg> element to add legend to
     * @param titles Array of strings as names for each line
     * @param colors Array of strings which should be HEX colors or CSS strings, i.e. 'red'.
     */
    LinePlot.prototype.create_legend = function (fontFamily) {
        if (fontFamily === void 0) { fontFamily = ""; }
        // import custom font
        this.svg.append('defs')
            .append('style')
            .attr('type', 'text/css')
            .text("@import url('https://fonts.googleapis.com/css?family=Zilla+Slab');");
        // Handmade legend
        var legend_x = 80;
        var legend_y = 40;
        var x_offset = 20;
        var y_offset = 20;
        var marker_side_length = 10;
        // draw squares of the correct colors
        for (var i = 0; i < this.lines.length; i++) {
            this.svg.append("rect")
                .attr("x", legend_x) // set x-pos
                .attr("y", legend_y - 5 + i * y_offset) // set y-pos
                .attr("width", marker_side_length) // set width
                .attr("height", marker_side_length / 2) // set height
                .style("fill", this.lines[i].color) // set color
                .style("border-radius", '3');
        }
        // add titles next to the circle markers
        for (var i = 0; i < this.lines.length; i++) {
            this.svg.append("text")
                .attr("x", legend_x + x_offset) // set x-pos
                .attr("y", legend_y + i * y_offset) // set y-pos
                .text(this.lines[i].title) // set title text
                .style("font-size", "15px") // set font size
                // .style("font-family", "Arial, Helvetica, sans-serif")
                .style("font-weight", "bold")
                .attr("alignment-baseline", "middle"); // justify center
        }
    };
    /**
     * plot the given lineData as a line on the svg object
     *
     * @param line Line object to be plotted
     * @param plot { svg: d3 svg object, xRange, yRange}
     * @return the plotted line
     */
    LinePlot.prototype.plot_line = function (line) {
        var xRange = this.xRange;
        var yRange = this.yRange;
        // this function plots the line
        var lineFunc = d3.line()
            .x(function (d) {
            return xRange(d.x);
        })
            .y(function (d) {
            return yRange(d.y);
        })
            .curve(d3.curveBasis); // interpolate the points as a smooth curve
        // use our lineFunc to plot the data
        var d3line = this.svg.append('svg:path')
            .attr('d', lineFunc(line.lineData))
            .attr('stroke', line.color)
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        line.setD3Line(d3line);
        // return the new line
        return d3line;
    };
    return LinePlot;
}());
exports.LinePlot = LinePlot;
;
//# sourceMappingURL=LinePlot.js.map