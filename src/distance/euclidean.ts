/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * euclidean.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Perceptual Euclidean color distance
	 */
	export class DistanceEuclidean implements Distance.IDistanceCalculator {
		protected _Pr : number;
		protected _Pg : number;
		protected _Pb : number;
		protected _Pa : number;

		protected _maxEuclideanDistance : number;

		constructor() {
			this._setDefaults();

			// set default maximal color component deltas (255 - 0 = 255)
			this.setWhitePoint(255, 255, 255, 255);
		}

		/**
		 * To simulate original RgbQuant distance use `r=255,g=255,b=255,a=0`
		 */
		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._maxEuclideanDistance = Math.sqrt(this.calculateRaw(r, g, b, a, 0, 0, 0, 0));
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
			return this._Pr * dR * dR + this._Pg * dG * dG + this._Pb * dB * dB + this._Pa * dA * dA;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxEuclideanDistance;
		}

		protected _setDefaults() : void {
			this._Pr = Color.Constants.sRGB.Y.RED;
			this._Pg = Color.Constants.sRGB.Y.GREEN;
			this._Pb = Color.Constants.sRGB.Y.BLUE;

			// TODO: what is the best coef below?
			this._Pa = 1;
		}
	}
}
