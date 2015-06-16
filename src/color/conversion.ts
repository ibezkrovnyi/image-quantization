/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * conversion.ts - part of Image Quantization Library
 */
module IQ.Color {
	export class Conversion {
		static rgb2lab(r : number, g : number, b : number) : { L : number; a : number; b: number } {
			var xyz = Conversion.rgb2xyz(r, g, b);
			return Conversion.xyz2lab(xyz.x, xyz.y, xyz.z);
		}

		static lab2rgb(L : number, a : number, b : number) : { r : number; g : number; b: number } {
			var xyz = Conversion.lab2xyz(L, a, b);
			return Conversion.xyz2rgb(xyz.x, xyz.y, xyz.z);
		}

		static rgb2xyz(r : number, g : number, b : number) : { x : number; y : number; z : number } {
			r = r / 255;        //R from 0 to 255
			g = g / 255;        //G from 0 to 255
			b = b / 255;        //B from 0 to 255

/*
			TODO: What is this?
			r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
			g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
			b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
*/

/*
			TODO: this will be removed because it is not by wiki: https://en.wikipedia.org/wiki/Lab_color_space and https://github.com/baldmountain/Squelch/blob/master/noiseimageunit/noiseimageunitFilterKernel.cikernel
			r = r * 100;
			g = g * 100;
			b = b * 100;
*/
			//Observer. = 2°, Illuminant = D65
			return {
				x : r * 0.4124 + g * 0.3576 + b * 0.1805, y : r * 0.2126 + g * 0.7152 + b * 0.0722, z : r * 0.0193 + g * 0.1192 + b * 0.9505
			}
		}

		// TODO: fix like rgb2xyz fixed
		static xyz2rgb(x : number, y : number, z : number) : { r : number; g : number; b : number } {
/*
			TODO: this will be removed because it is not by wiki: https://en.wikipedia.org/wiki/Lab_color_space and https://github.com/baldmountain/Squelch/blob/master/noiseimageunit/noiseimageunitFilterKernel.cikernel
			x = x / 100;        //X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
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

/*
 		TODO: this will be removed because it is not by wiki: https://en.wikipedia.org/wiki/Lab_color_space and https://github.com/baldmountain/Squelch/blob/master/noiseimageunit/noiseimageunitFilterKernel.cikernel
		private static _refX : number = 95.047; //ref_X =  95.047   Observer= 2°, Illuminant= D65
		private static _refY : number = 100.00; //ref_Y = 100.000
		private static _refZ : number = 108.883; //ref_Z = 108.883
*/

		private static _refX : number = 0.95047; //ref_X =  95.047   Observer= 2°, Illuminant= D65
		private static _refY : number = 0.10000; //ref_Y = 100.000
		private static _refZ : number = 1.08883; //ref_Z = 108.883

		private static _xyz2lab_helper(value  : number) : number {
			return value > 0.008856451679035631 ? Math.pow(value, 1 / 3) : ( 7.787037037037037 * value + 0.13793103448275862);
		}
		static xyz2lab(x : number, y : number, z : number) : {L : number; a : number; b : number} {
			x = x / Conversion._refX;          //ref_X =  95.047   Observer= 2°, Illuminant= D65
			y = y / Conversion._refY;          //ref_Y = 100.000
			z = z / Conversion._refZ;          //ref_Z = 108.883

			x = Conversion._xyz2lab_helper(x);
			y = Conversion._xyz2lab_helper(y);
			z = Conversion._xyz2lab_helper(z);

			return {
				L : ( 116 * y ) - 16,
				a : 500 * ( x - y ),
				b : 200 * ( y - z )
			}
		}

		// TODO: fix like xyz2lab fixed
		static lab2xyz(L : number, a : number, b : number) : {x : number; y : number; z : number} {
			var y = ( L + 16 ) / 116, x = a / 500 + y, z = y - b / 200;

			var y3 = Math.pow(y, 3), x3 = Math.pow(x, 3), z3 = Math.pow(z, 3);

			y = y3 > 0.008856 ? y3 : ( y - 16 / 116 ) / 7.787;
			x = x3 > 0.008856 ? x3 : ( x - 16 / 116 ) / 7.787;
			z = z3 > 0.008856 ? z3 : ( z - 16 / 116 ) / 7.787;

			return {
				x : Conversion._refX * x,     //ref_X =  95.047     Observer= 2°, Illuminant= D65
				y : Conversion._refY * y,     //ref_Y = 100.000
				z : Conversion._refZ * z     //ref_Z = 108.883
			}
		}

		// http://alienryderflex.com/hsp.html
		static rgb2lum(r : number, g : number, b : number) : number {
			// TODO: luma = point.r * RED_COEFFICIENT + point.g * GREEN_COEFFICIENT + point.b * BLUE_COEFFICIENT
			// TODO: why here another formula??
			return Math.sqrt(Constants.sRGB.Y.RED * r * r + Constants.sRGB.Y.GREEN * g * g + Constants.sRGB.Y.BLUE * b * b);
		}

		// http://rgb2hsl.nichabi.com/javascript-function.php
		static rgb2hsl(r : number, g : number, b : number) {
			var max, min, h, s, l, d;
			r /= 255;
			g /= 255;
			b /= 255;
			max = Utils.max3(r, g, b);
			min = Utils.min3(r, g, b);
			l = (max + min) / 2;
			if (max == min) {
				h = s = 0;
			} else {
				d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break
				}
				h /= 6;
			}
			//		h = Math.floor(h * 360)
			//		s = Math.floor(s * 100)
			//		l = Math.floor(l * 100)
			return {
				h : h, s : s, l : Conversion.rgb2lum(r, g, b)
			};
		}
	}
}
