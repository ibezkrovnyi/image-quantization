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

	export class ErrorDiffusionRiemersma implements IImageDitherer {
		private _distance : Distance.IDistanceCalculator;
		private _weights : number[];
		private _errorQueueSize : number;
		private _errorPropagation : number;
		private _max : number;

		constructor(colorDistanceCalculator : Distance.IDistanceCalculator, errorQueueSize : number = 16, errorPropagation : number = 1) {
			this._distance = colorDistanceCalculator;
			this._errorPropagation = errorPropagation;
			this._errorQueueSize = errorQueueSize;
			this._max = this._errorQueueSize;
			this._createWeights();
		}

		public quantize(pointBuffer : Utils.PointContainer, palette : Utils.Palette) : Utils.PointContainer {
			var curve                                                           = new SpaceFillingCurves.HilbertCurveBase(),
				pointArray                                                      = pointBuffer.getPointArray(),
				width                                                           = pointBuffer.getWidth(),
				height                                                          = pointBuffer.getHeight(),
				errorQueue : {r : number; g : number; b : number; a : number}[] = [],
				head                                                            = 0;

			for (var i = 0; i < this._errorQueueSize; i++) {
				errorQueue[i] = {r : 0, g : 0, b : 0, a : 0};
			}

			// just for test!!
			var testArray = new Array(height * width);
			for (var i = 0; i < testArray.length; i++) {
				testArray[i] = 0;
			}

			curve.walk(width, height, (x, y) => {
				// just for test
				testArray[x + y * width]++;

				var p = pointArray[x + y * width], r = p.r, g = p.g, b = p.b, a = p.a;
				for (var i = 0; i < this._errorQueueSize; i++) {
					var weight = this._weights[i],
						e      = errorQueue[(i + head) % this._errorQueueSize];

					r += e.r * weight;
					g += e.g * weight;
					b += e.b * weight;
					a += e.a * weight;
				}

				var correctedPoint = Utils.Point.createByRGBA(
						Arithmetic.intInRange(r, 0, 255),
						Arithmetic.intInRange(g, 0, 255),
						Arithmetic.intInRange(b, 0, 255),
						Arithmetic.intInRange(a, 0, 255)
					),
					quantizedPoint = palette.getNearestColor(this._distance, correctedPoint);

				// update head and calculate tail
				head = (head + 1) % this._errorQueueSize;
				var tail = (head + this._errorQueueSize - 1) % this._errorQueueSize;

				// update error with new value
				errorQueue[tail].r = p.r - quantizedPoint.r;
				errorQueue[tail].g = p.g - quantizedPoint.g;
				errorQueue[tail].b = p.b - quantizedPoint.b;
				errorQueue[tail].a = p.a - quantizedPoint.a;

				// update point
				p.from(quantizedPoint);
			});

			// just for test
			for (var i = 0; i < testArray.length; i++) {
				if (testArray[i] !== 1) throw new Error("x");
			}
			return pointBuffer;
		}

		private _createWeights() : void {
			this._weights = [];

			var multiplier = Math.exp(Math.log(this._max) / (this._errorQueueSize - 1));
			for (var i = 0, next = 1; i < this._errorQueueSize; i++) {
				this._weights[i] = (((next + 0.5) | 0) / this._max) * this._errorPropagation;
				next *= multiplier;
			}
		}
	}
}
