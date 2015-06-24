/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * manhattanSRGB.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Manhattan distance
	 */
	export class ManhattanSRGB extends Manhattan implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;

			// TODO: what is the best coef below?
			this._Pa = 1;
		}
	}
}
