/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * manhattan.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Manhattan distance
	 */
	export class DistanceManhattan implements IDistanceCalculator {
		protected _Pr : number;
		protected _Pg : number;
		protected _Pb : number;
		protected _Pa : number;

		protected _maxManhattanDistance : number;

		constructor() {
			this._setDefaults();

			// set default maximal color component deltas (255 - 0 = 255)
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._maxManhattanDistance = this.calculateRaw(r, g, b, a, 0, 0, 0, 0);
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a) / this._maxManhattanDistance;
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
			if (dR < 0) dR = 0 - dR;
			if (dG < 0) dG = 0 - dG;
			if (dB < 0) dB = 0 - dB;
			if (dA < 0) dA = 0 - dA;

			return this._Pr * dR + this._Pg * dG + this._Pb * dB + this._Pa * dA;
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
