/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * xyz2rgb.ts - part of Image Quantization Library
 */
import {intInRange} from "../utils/arithmetic"

export function xyz2rgb(x : number, y : number, z : number) : { r : number; g : number; b : number } {
	// Observer. = 2°, Illuminant = D65
	var r = x * 3.2406 + y * -1.5372 + z * -0.4986,
		g = x * -0.9689 + y * 1.8758 + z * 0.0415,
		b = x * 0.0557 + y * -0.2040 + z * 1.0570;

	// gamma correction, see https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
	r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
	g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
	b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

	return {
		r : intInRange(r * 255, 0, 255),
		g : intInRange(g * 255, 0, 255),
		b : intInRange(b * 255, 0, 255)
	}
}

