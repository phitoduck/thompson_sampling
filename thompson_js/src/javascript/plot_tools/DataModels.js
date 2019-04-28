"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A point in R^2. Used to represent position and velocity.
 */
var Tuple = /** @class */ (function () {
    function Tuple($x, $y) {
        this.x = $x;
        this.y = $y;
    }
    Tuple.prototype.getX = function () {
        return this.x;
    };
    Tuple.prototype.setX = function (x) {
        this.x = x;
    };
    Tuple.prototype.getY = function () {
        return this.y;
    };
    Tuple.prototype.setY = function (y) {
        this.y = y;
    };
    // add two tuples together componentwise
    Tuple.addTuples = function (tup1, tup2) {
        return new Tuple(tup1.getX() + tup2.getX(), tup1.getY() + tup2.getY());
    };
    // add the values of a new tuple to this tuple
    Tuple.prototype.add = function (tuple) {
        this.x += tuple.getX();
        this.y += tuple.getY();
    };
    // multiply each entry of the tuple by a constant
    Tuple.prototype.times = function (num) {
        return new Tuple(this.x * num, this.y * num);
    };
    /**
     * Get a tuple whose entries are all one number
     * @param num number to populate the tuple with
     */
    Tuple.createTupleOfNum = function (num) {
        return new Tuple(num, num);
    };
    Tuple.deserialize = function (json) {
        var x, y;
        if (typeof (json.x) === 'number'
            && typeof (json.y) === 'number') {
            x = json.x;
            y = json.y;
        }
        else {
            throw new Error("cannot deserialize " + json + " as Tuple");
        }
        return new Tuple(x, y);
    };
    Tuple.ORIGIN = new Tuple(0, 0);
    Tuple.DEFAULT_SPAWN_LOCATION = new Tuple(200, 200);
    return Tuple;
}());
exports.Tuple = Tuple;
//# sourceMappingURL=DataModels.js.map