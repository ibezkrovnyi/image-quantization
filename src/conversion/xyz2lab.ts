/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * xyz2lab.ts - part of Image Quantization Library
 */
module IQ.Conversion {

	var _refX : number = 0.95047, //ref_X =  95.047   Observer= 2°, Illuminant= D65
		_refY : number = 0.10000, //ref_Y = 100.000
		_refZ : number = 1.08883; //ref_Z = 108.883

	function _xyz2lab_helper(value : number) : number {
		return value > 0.008856451679035631 ? Math.pow(value, 1 / 3) : ( 7.787037037037037 * value + 0.13793103448275862);
	}

	export function xyz2lab(x : number, y : number, z : number) : {L : number; a : number; b : number} {
		x = x / _refX;          //ref_X =  95.047   Observer= 2°, Illuminant= D65
		y = y / _refY;          //ref_Y = 100.000
		z = z / _refZ;          //ref_Z = 108.883

		x = _xyz2lab_helper(x);
		y = _xyz2lab_helper(y);
		z = _xyz2lab_helper(z);

		return {
			L : ( 116 * y ) - 16,
			a : 500 * ( x - y ),
			b : 200 * ( y - z )
		}
	}

}
