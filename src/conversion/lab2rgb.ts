/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * lab2rgb.ts - part of Image Quantization Library
 */
module IQ.Conversion {

	export function lab2rgb(L : number, a : number, b : number) : { r : number; g : number; b: number } {
		var xyz = lab2xyz(L, a, b);
		return xyz2rgb(xyz.x, xyz.y, xyz.z);
	}
}
