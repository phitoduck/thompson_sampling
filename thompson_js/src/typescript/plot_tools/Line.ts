import { Tuple } from './DataModels';

/**
 * Represents a line that can be plotted in a LinePlot
 */
export class Line {

    public lineData: Array<Tuple>; // {x, y} coordinates for all points on line
    public title: string;          // for legend
    public color: string;          // for legend marker color
    public d3Line = null;          // reference to the d3Line object created when plotting

    constructor(lineData: Array<Tuple>, title: string, color: string) {
        this.lineData = lineData;
        this.title = title;
        this.color = color;
    }

    public setD3Line(d3Line) {
        this.d3Line = d3Line;
    }

}