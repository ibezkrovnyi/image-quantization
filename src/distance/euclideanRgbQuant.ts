/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * euclideanRgbQuant.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Euclidean color distance (RgbQuant modification w/o Alpha)
	 */
	export class DistanceEuclideanRgbQuantWOAlpha extends DistanceEuclidean implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;
			this._Pa = 0;
		}
	}
}
