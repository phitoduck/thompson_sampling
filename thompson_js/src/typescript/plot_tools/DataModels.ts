/**
 * A point in R^2. Used to represent position and velocity.
 */
export class Tuple {

    public x: number;
    public y: number;

    public static ORIGIN = new Tuple(0, 0);
    public static DEFAULT_SPAWN_LOCATION = new Tuple(200, 200);

    constructor($x: number, $y: number) {
		this.x = $x;
		this.y = $y;
    }

    public getX(): number {
        return this.x;
    }

    public setX(x: number): void {
        this.x = x;
    }

    public getY(): number {
        return this.y;
    }

    public setY(y: number): void {
        this.y = y;
    }

    // add two tuples together componentwise
    public static addTuples(tup1: Tuple, tup2: Tuple): Tuple {
        return new Tuple(
            tup1.getX() + tup2.getX(),
            tup1.getY() + tup2.getY()
        );
    }
    
    // add the values of a new tuple to this tuple
    public add(tuple: Tuple): void {
        this.x += tuple.getX();
        this.y += tuple.getY();
    }


    // multiply each entry of the tuple by a constant
    public times(num: number): Tuple {
        return new Tuple(this.x * num, this.y * num);
    }

    /**
     * Get a tuple whose entries are all one number
     * @param num number to populate the tuple with
     */
    public static createTupleOfNum(num: number): Tuple {
        return new Tuple(num, num);
    }

    public static deserialize(json: any): Tuple {
        let x: number, y: number;
        if (typeof(json.x) === 'number'
            && typeof(json.y) === 'number') {
            x = json.x;
            y = json.y;
        } else {
            throw new Error(`cannot deserialize ${json} as Tuple`)
        }

        return new Tuple(x, y);
    }

}