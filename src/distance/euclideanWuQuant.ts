/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * euclideanWuQuant.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Euclidean color distance (WuQuant modification)
 	 */
	export class EuclideanWuQuant extends Euclidean implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = this._Pg = this._Pb = this._Pa = 1;
		}
	}
}
