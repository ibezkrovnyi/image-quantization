module IQ.Image.SpaceFillingCurves {

    enum Direction {
        NONE = 0,
        UP,
        LEFT,
        RIGHT,
        DOWN,
    }

    // Check code against double-entrance into walk (walk=> callback => walk)
    export class HilbertCurveBase {
        private _x : number;
        private _y : number;
        private _d : number;
        private _width : number;
        private _height : number;
        private _callback : (x:number, y:number, d:number) => void;
        private _level : number;

        public walk(width:number, height:number, visitorCallback:(x:number, y:number, d:number) => void):void {
            this._x = 0;
            this._y = 0;
            this._d = 0;
            this._width = width;
            this._height = height;
            this._callback = visitorCallback;

            var maxBound = Math.max(width, height),
                depth = 0;

            while (maxBound > 0) {
                maxBound >>= 1;
                depth++;
            }

            if ((1 << depth) < maxBound) {
                depth++;
                throw new Error("Strange?");
            }

            if (depth > 1) {
                this._level = depth;
                //this._walkHilbert(depth - 1, Direction.UP);
                this._walkHilbert(Direction.UP);
            }

            this._visit(Direction.NONE);
        }

        _walkHilbert(direction) {
            this._level--;

            if (this._level >= 0) {
                switch (direction) {
                    case Direction.LEFT:
                        this._walkHilbert(Direction.UP);
                        this._visit(Direction.RIGHT);
                        this._walkHilbert(Direction.LEFT);
                        this._visit(Direction.DOWN);
                        this._walkHilbert(Direction.LEFT);
                        this._visit(Direction.LEFT);
                        this._walkHilbert(Direction.DOWN);
                        break;

                    case Direction.RIGHT:
                        this._walkHilbert(Direction.DOWN);
                        this._visit(Direction.LEFT);
                        this._walkHilbert(Direction.RIGHT);
                        this._visit(Direction.UP);
                        this._walkHilbert(Direction.RIGHT);
                        this._visit(Direction.RIGHT);
                        this._walkHilbert(Direction.UP);
                        break;

                    case Direction.UP:
                        this._walkHilbert(Direction.LEFT);
                        this._visit(Direction.DOWN);
                        this._walkHilbert(Direction.UP);
                        this._visit(Direction.RIGHT);
                        this._walkHilbert(Direction.UP);
                        this._visit(Direction.UP);
                        this._walkHilbert(Direction.RIGHT);
                        break;

                    case Direction.DOWN:
                        this._walkHilbert(Direction.RIGHT);
                        this._visit(Direction.UP);
                        this._walkHilbert(Direction.DOWN);
                        this._visit(Direction.LEFT);
                        this._walkHilbert(Direction.DOWN);
                        this._visit(Direction.DOWN);
                        this._walkHilbert(Direction.LEFT);
                        break;

                    default:
                        break;
                }
            }

            this._level++;
        }

        private _visit(direction : Direction) : void {
            if(this._x >= 0 && this._x < this._width && this._y >= 0 && this._y < this._height) {
                this._callback(this._x, this._y, this._d);
                this._d++;
            }
            switch (direction) {
                case Direction.LEFT: this._x--; break;
                case Direction.RIGHT: this._x++; break;
                case Direction.UP:this._y--; break;
                case Direction.DOWN: this._y++; break;
            }
        }

        /*
         protected _visiter(x:number, y:number, d:number):void {
         throw new Error("HilbertCurveBase#_visiter method should be implemented");
         }

         // convert (x,y) to d
         public xy2d(n:number, x:number, y:number):number {
         var d = 0;
         for (var s = n / 2; s > 0; s /= 2) {
         var rx = (x & s) > 0,
         ry = (y & s) > 0;

         d += s * s * ((3 * rx) ^ ry);
         var rotateResult = this._rotate(s, x, y, rx, ry);
         x = rotateResult.x;
         y = rotateResult.y;
         }
         return d;
         }

         //convert d to (x,y)
         public d2xy(n:number, d:number):{x : number; y : number} {
         var t = d,
         x = 0, y = 0;

         for (var s = 1; s < n; s *= 2) {
         var rx = 1 & (t / 2),
         ry = 1 & (t ^ rx),
         rotateResult = this._rotate(s, x, y, rx, ry);

         x = rotateResult.x;
         y = rotateResult.y;
         x += s * rx;
         y += s * ry;
         t /= 4;
         }

         return {
         x: x,
         y: y
         };
         }

         // rotate/flip a quadrant appropriately
         private _rotate(n:number, x:number, y:number, rx:number, ry:number):{x : number; y : number} {
         if (ry == 0) {
         if (rx == 1) {
         x = n - 1 - x;
         y = n - 1 - y;
         }

         //Swap x and y
         var t = x;
         x = y;
         y = t;
         }

         return {
         x: x,
         y: y
         };
         }
         */
    }
}
