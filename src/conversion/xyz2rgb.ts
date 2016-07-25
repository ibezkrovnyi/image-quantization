/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * xyz2rgb.ts - part of Image Quantization Library
 */
// TODO: fix like rgb2xyz fixed
export function xyz2rgb(x : number, y : number, z : number) : { r : number; g : number; b : number } {
	/*
	 TODO: this will be removed because it is not by wiki: https://en.wikipedia.org/wiki/Lab_color_space and https://github.com/baldmountain/Squelch/blob/master/noiseimageunit/noiseimageunitFilterKernel.cikernel
	 x = x / 100;        //X from 0 to  95.047      (Observer = 2�, Illuminant = D65)
	 y = y / 100;        //Y from 0 to 100.000
	 z = z / 100;        //Z from 0 to 108.883
	 */

	var r = x * 3.2406 + y * -1.5372 + z * -0.4986, g = x * -0.9689 + y * 1.8758 + z * 0.0415, b = x * 0.0557 + y * -0.2040 + z * 1.0570;

	/*
	 // TODO: what is this?
	 r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
	 g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
	 b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;
	 */

	return {
		r : r * 255, g : g * 255, b : b * 255
	}
}

