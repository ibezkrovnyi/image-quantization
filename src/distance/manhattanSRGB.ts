/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * manhattanSRGB.ts - part of Image Quantization Library
 */
import {IDistanceCalculator} from "./common"
import {Manhattan} from "./manhattan"
import * as bt709 from "../constants/bt709"

/**
 * Manhattan distance
 */
export class ManhattanSRGB extends Manhattan implements IDistanceCalculator {
	protected _setDefaults() : void {
		this._Pr = bt709.Y.RED;
		this._Pg = bt709.Y.GREEN;
		this._Pb = bt709.Y.BLUE;

		// TODO: what is the best coef below?
		this._Pa = 1;
	}
}

