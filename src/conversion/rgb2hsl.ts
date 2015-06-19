/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * rgb2hsl.ts - part of Image Quantization Library
 */
module IQ.Conversion {

	/**
	 * Calculate HSL from RGB
	 * Hue is in degrees [0..360]
	 * Lightness: [0..1]
	 * Saturation: [0..1]
	 * http://web.archive.org/web/20060914040436/http://local.wasp.uwa.edu.au/~pbourke/colour/hsl/
	 */
	export function rgb2hsl(r : number, g : number, b : number) : {h : number; s : number; l : number} {
		var min = Arithmetic.min3(r, g, b),
			max = Arithmetic.max3(r, g, b),
			delta = max - min,
			l = (min + max) / 510,
			s = 0;

		if (l > 0 && l < 1)
			s = delta / (l < 0.5 ? (max + min) : (510 - max - min));

		var h = 0;
		if (delta > 0) {
			if (max === r) {
				h = (g - b) / delta;
			} else if (max === g) {
				h = (2 + (b - r) / delta);
			} else {
				h = (4 + (r - g) / delta);
			}

			h *= 60;
			if (h < 0) h += 360;
		}
		return {h : h, s : s, l : l};
	}
}
