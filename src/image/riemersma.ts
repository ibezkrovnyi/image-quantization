/**
 * @preserve
 * MIT License
 *
 * Copyright 2015 Igor Bezkrovny
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * nearestColor.ts - part of Image Quantization Library
 */

///<reference path='common.ts' />
///<reference path="spaceFillingCurves/hilbertCurve.ts"/>
module IQ.Image {

    export class DitherRiemersma implements IImageDitherer {
        private _distance : Distance.IDistanceCalculator;

        constructor (colorDistanceCalculator : Distance.IDistanceCalculator) {
            this._distance = colorDistanceCalculator;
        }

        public quantize(pointBuffer:Utils.PointContainer, palette:Utils.Palette):Utils.PointContainer {
            var pointArray = pointBuffer.getPointArray(),
                width = pointBuffer.getWidth(),
                height = pointBuffer.getHeight(),
                errorArray = [],
                weightsArray = [25/100, 40/100, 63/100, 100/100];
                //weightsArray = [1/16, 2/16, 3/16, 4/16, 5/16, 6/16, 7/16, 8/16, 9/16, 10/16, 11/16, 12/16, 13/16, 14/16, 15/16, 16/16];
                //weightsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];

/*
            var sum = 0;
            for (var i = 0; i < weightsArray.length; i++) {
                sum += weightsArray[i];
            }
            for (var i = 0; i < weightsArray.length; i++) {
                weightsArray[i] /= sum;
            }
*/

            for (var i = 0; i < 4; i++) {
                errorArray[i] = [];
                for (var j = 0; j < weightsArray.length; j++) {
                    errorArray[i].push(0);
                }
            }

            var curve = new SpaceFillingCurves.HilbertCurveBase();

            var t = new Array(height * width);
            for(var i = 0; i < t.length; i++) {
                t[i] = 0;
            }
            curve.walk(width, height, (x, y) => {
                t[x + y * width]++;
                var p = pointArray[x + y * width],
                    originalPoint = Utils.Point.createByUint32(p.uint32);

                for (var componentIndex = 0; componentIndex < errorArray.length; componentIndex++) {
                    var sum = 0;
                    for (var errorArrayIndex = 0; errorArrayIndex < errorArray.length; errorArrayIndex++) {
                        sum += errorArray[componentIndex][errorArrayIndex] * weightsArray[errorArrayIndex];
                    }

                    p.rgba[componentIndex] = Math.max(0, Math.min(255, (p.rgba[componentIndex] + sum) | 0));
                }

                var correctedPoint = Utils.Point.createByQuadruplet(p.rgba),
                    palettePoint = palette.getNearestColor(this._distance, correctedPoint);

                for (var quadrupletIndex = 0; quadrupletIndex < errorArray.length; quadrupletIndex++) {
                    var componentErrorArray = errorArray[quadrupletIndex];
                    componentErrorArray.shift();
                    componentErrorArray.push(originalPoint.rgba[quadrupletIndex] - palettePoint.rgba[quadrupletIndex]);
                }

                p.from(palettePoint);
            });

            for(var i = 0; i < t.length; i++) {
                if(t[i] !== 1) throw new Error("x");
            }


            /*
                        function simpleCurve(width, height, callback:(x:number, y:number, index:number) => void) {
                            for (var y = 0, index = 0; y < height; y++) {
                                for (var x = 0; x < width; x++, index++) {
                                    callback(x, y, index);
                                }

                            }
                        }
            */

/*
            simpleCurve(width, height, (x, y, index) => {
                var p = pointArray[index];

                for (var quadrupletIndex = 0; quadrupletIndex < errorArray.length; quadrupletIndex++) {
                    var sum = 0;
                    for (var errorArrayIndex = 0; errorArrayIndex < errorArray.length; errorArrayIndex++) {
                        sum += errorArray[quadrupletIndex][errorArrayIndex] * weightsArray[errorArrayIndex];
                    }

                    p.rgba[quadrupletIndex] = Math.max(0, Math.min(255, (p.rgba[quadrupletIndex] + sum) | 0));
                }

                var correctedPoint = Point.createByQuadruplet(p.rgba),
                    palettePoint = palette.nearestColor(correctedPoint);

                for (var quadrupletIndex = 0; quadrupletIndex < errorArray.length; quadrupletIndex++) {
                    var componentErrorArray = errorArray[quadrupletIndex];
                    componentErrorArray.shift();
                    componentErrorArray.push(p.rgba[quadrupletIndex] - palettePoint.rgba[quadrupletIndex]);
                }

                p.from(palettePoint);
            });
*/
            return pointBuffer;
        }
    }
}
