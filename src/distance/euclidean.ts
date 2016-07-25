/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * euclidean.ts - part of Image Quantization Library
 */
import {IDistanceCalculator} from "./common"
import {Point} from "../utils/point"

/**
 * Euclidean color distance
 */
export class Euclidean implements IDistanceCalculator {
	protected _Pr : number;
	protected _Pg : number;
	protected _Pb : number;
	protected _Pa : number;

	protected _maxEuclideanDistance : number;

	constructor() {
		this._setDefaults();

		// set default maximal color component deltas (255 - 0 = 255)
		this.setWhitePoint(255, 255, 255, 255);
	}

	/**
	 * To simulate original RgbQuant distance use `r=255,g=255,b=255,a=0`
	 */
	setWhitePoint(r : number, g : number, b : number, a : number) : void {
		this._maxEuclideanDistance = Math.sqrt(this.calculateRaw(r, g, b, a, 0, 0, 0, 0));
	}

	calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
		var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
		return this._Pr * dR * dR + this._Pg * dG * dG + this._Pb * dB * dB + this._Pa * dA * dA;
	}

	calculateNormalized(colorA : Point, colorB : Point) : number {
		return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxEuclideanDistance;
	}

	protected _setDefaults() : void {
		this._Pr = this._Pg = this._Pb = this._Pa = 1;
	}
}

