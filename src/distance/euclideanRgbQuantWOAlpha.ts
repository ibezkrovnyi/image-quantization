/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * euclideanRgbQuantWOAlpha.ts - part of Image Quantization Library
 */
import { IDistanceCalculator } from "./common"
import { Euclidean } from "./euclidean"
import * as bt709 from "../constants/bt709"

/**
 * Euclidean color distance (RgbQuant modification w/o Alpha)
 */
export class EuclideanRgbQuantWOAlpha extends Euclidean implements IDistanceCalculator {
	protected _setDefaults() : void {
		this._Pr = bt709.Y.RED;
		this._Pg = bt709.Y.GREEN;
		this._Pb = bt709.Y.BLUE;
		this._Pa = 0;
	}
}

