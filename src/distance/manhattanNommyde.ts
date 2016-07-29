/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * manhattanSRGB.ts - part of Image Quantization Library
 */
import { IDistanceCalculator } from "./common"
import { Manhattan } from "./manhattan"

/**
 * Manhattan distance
 */
export class ManhattanNommyde extends Manhattan implements IDistanceCalculator {
	protected _setDefaults() : void {
		this._Pr = 0.4984;
		this._Pg = 0.8625;
		this._Pb = 0.2979;

		// TODO: what is the best coef below?
		this._Pa = 1;
	}
}

