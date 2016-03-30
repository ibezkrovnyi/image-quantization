/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * xyz2rgb.ts - part of Image Quantization Library
 */
module IQ.Conversion {

	// TODO: fix like rgb2xyz fixed
	export function xyz2rgb(x : number, y : number, z : number) : { r : number; g : number; b : number } {
		var r = x * 3.2406 + y * -1.5372 + z * -0.4986, g = x * -0.9689 + y * 1.8758 + z * 0.0415, b = x * 0.0557 + y * -0.2040 + z * 1.0570;

		// Convert linear CIE RGB to gamma corrected sRGB
		r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
		g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
		b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

		return {
			r : r * 255, g : g * 255, b : b * 255
		}
	}
}
