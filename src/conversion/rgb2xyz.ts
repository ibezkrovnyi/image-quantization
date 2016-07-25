/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * rgb2xyz.ts - part of Image Quantization Library
 */
export function rgb2xyz(r : number, g : number, b : number) : { x : number; y : number; z : number } {
	r = r / 255;        //R from 0 to 255
	g = g / 255;        //G from 0 to 255
	b = b / 255;        //B from 0 to 255

	r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

	/*
	 TODO: this will be removed because it is not by wiki: https://en.wikipedia.org/wiki/Lab_color_space and https://github.com/baldmountain/Squelch/blob/master/noiseimageunit/noiseimageunitFilterKernel.cikernel
	 r = r * 100;
	 g = g * 100;
	 b = b * 100;
	 */
	//Observer. = 2�, Illuminant = D65
	return {
		x : r * 0.4124 + g * 0.3576 + b * 0.1805,
		y : r * 0.2126 + g * 0.7152 + b * 0.0722,
		z : r * 0.0193 + g * 0.1192 + b * 0.9505
	}
}

