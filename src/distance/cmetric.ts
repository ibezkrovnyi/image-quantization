/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * cmetric.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * TODO: Name it: http://www.compuphase.com/cmetric.htm
	 */
	export class CMETRIC implements IDistanceCalculator {
		private _rCoefficient : number;
		private _gCoefficient : number;
		private _bCoefficient : number;
		private _aCoefficient : number;
		private _maxDistance : number;

		constructor() {
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._rCoefficient = 255 / r;
			this._gCoefficient = 255 / g;
			this._bCoefficient = 255 / b;
			this._aCoefficient = 255 / a;
			this._maxDistance = Math.sqrt(this.calculateRaw(0, 0, 0, 0, r, g, b, a));
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var rmean = ( r1 + r2 ) / 2 * this._rCoefficient,
				r = (r1 - r2) * this._rCoefficient,
				g = (g1 - g2) * this._gCoefficient,
				b = (b1 - b2) * this._bCoefficient,
				dE = ((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8)),
				dA = (a2 - a1) * this._aCoefficient;

			return (dE + dA * dA);
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxDistance;
		}

	}
}
