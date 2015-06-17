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
	 * Hue is between 0 and 1 (degrees = hue * 360)
	 * Lightness is between 0 and 1
	 * Saturation is between 0 and 1
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
			if (max == r && max != g)
				h += (g - b) / delta;
			if (max == g && max != b)
				h += (2 + (b - r) / delta);
			if (max == b && max != r)
				h += (4 + (r - g) / delta);

			h /= 6;
		}
		return {h : h, s : s, l : l};
	}
}
