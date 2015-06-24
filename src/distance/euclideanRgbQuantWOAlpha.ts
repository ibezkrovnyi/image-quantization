/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * euclideanRgbQuantWOAlpha.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Euclidean color distance (RgbQuant modification w/o Alpha)
	 */
	export class EuclideanRgbQuantWOAlpha extends Euclidean implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;
			this._Pa = 0;
		}
	}
}
