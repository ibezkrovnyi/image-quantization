/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * rgb2lab.ts - part of Image Quantization Library
 */
module IQ.Conversion {

	export function rgb2lab(r : number, g : number, b : number) : { L : number; a : number; b: number } {
		var xyz = rgb2xyz(r, g, b);
		return xyz2lab(xyz.x, xyz.y, xyz.z);
	}
}
