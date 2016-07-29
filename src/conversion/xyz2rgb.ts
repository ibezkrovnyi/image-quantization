/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * xyz2rgb.ts - part of Image Quantization Library
 */
import { roundIn8bit } from "../utils/arithmetic"

// gamma correction, see https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
function correctGamma(n : number) {
	return n > 0.0031308 ? 1.055 * Math.pow(n, 1 / 2.4) - 0.055 : 12.92 * n;
}

export function xyz2rgb(x : number, y : number, z : number) : { r : number; g : number; b : number } {
	// Observer. = 2°, Illuminant = D65
	var r = correctGamma(x * 3.2406 + y * -1.5372 + z * -0.4986),
		g = correctGamma(x * -0.9689 + y * 1.8758 + z * 0.0415),
		b = correctGamma(x * 0.0557 + y * -0.2040 + z * 1.0570);

	return {
		r : roundIn8bit(r * 255),
		g : roundIn8bit(g * 255),
		b : roundIn8bit(b * 255)
	}
}

