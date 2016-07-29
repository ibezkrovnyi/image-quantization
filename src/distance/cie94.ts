/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * cie94.ts - part of Image Quantization Library
 */
import { IDistanceCalculator } from "./common"
import { Point } from "../utils/point"
import { rgb2lab } from "../conversion/rgb2lab"

/**
 * Computes CIE94 distance between 2 colors in LAB space.
 *
 * p1 = [l1, a1, b1]
 * p2 = [l2, a2, b2]
 * Returns distance:float
 *
 * Usage example:
 *     var d = CIE94_dist([94.0, -0.1, -0.55], [77.0, 0.5, 0.45])
 *
 * Iulius Curt, april 2013
 */
export class CIE94 implements IDistanceCalculator {
	private static _Kl = 2.0;
	private static _K1 = 0.048;
	private static _K2 = 0.014;

	private _whitePoint : {r : number; g : number; b : number; a : number};
	private _maxCIE94Distance : number;

	constructor() {
		// set default maximal color component deltas (255 - 0 = 255)
		this.setWhitePoint(255, 255, 255, 255);
	}

	setWhitePoint(r : number, g : number, b : number, a : number) : void {
		this._whitePoint       = { r : 255 / r, g : 255 / g, b : 255 / b, a : a };
		// TODO: calculate it dynamically, taking into account alpha
		this._maxCIE94Distance = 200;
	}

	calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
		// TODO: rewrite code to allow any of components to support 0 for white point
		var lab1 = rgb2lab(r1 * this._whitePoint.r, g1 * this._whitePoint.g, b1 * this._whitePoint.b),
			lab2 = rgb2lab(r2 * this._whitePoint.r, g2 * this._whitePoint.g, b2 * this._whitePoint.b);

		var dL     = lab1.L - lab2.L,
			dA     = lab1.a - lab2.a,
			dB     = lab1.b - lab2.b,
			c1     = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b),
			c2     = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b),
			dC     = c1 - c2,
			deltaH = dA * dA + dB * dB - dC * dC;

		deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

		// TODO: add alpha channel support
		var i = Math.pow(dL / CIE94._Kl, 2) + Math.pow(dC / (1.0 + CIE94._K1 * c1), 2) + Math.pow(deltaH / (1.0 + CIE94._K2 * c1), 2);
		return i < 0 ? 0 : i;
	}

	calculateNormalized(colorA : Point, colorB : Point) : number {
		return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxCIE94Distance;
	}
}
