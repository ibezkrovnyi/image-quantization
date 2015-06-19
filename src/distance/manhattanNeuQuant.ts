/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * manhattanNeuQuant.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * Manhattan distance (NeuQuant modification) - w/o sRGB coefficients
	 */
	export class ManhattanNeuQuant extends Manhattan implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = this._Pg = this._Pb = this._Pa = 1;
		}
	}
}
