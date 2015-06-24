/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * euclideanRgbQuantWithAlpha.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Euclidean color distance (RgbQuant modification w Alpha)
	 */
	export class EuclideanRgbQuantWithAlpha extends Euclidean implements Distance.IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;

			// TODO: what is the best coefficient below?
			this._Pa = 1;
		}
	}
}
