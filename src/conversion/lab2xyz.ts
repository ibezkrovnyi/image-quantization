/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * lab2xyz.ts - part of Image Quantization Library
 */

var _refX : number = 0.95047, //ref_X =  95.047   Observer= 2°, Illuminant = D65
	_refY : number = 0.10000, //ref_Y = 100.000
	_refZ : number = 1.08883; //ref_Z = 108.883

export function lab2xyz(L : number, a : number, b : number) : {x : number; y : number; z : number} {
	var y = ( L + 16 ) / 116, x = a / 500 + y, z = y - b / 200;

	var y3 = Math.pow(y, 3), x3 = Math.pow(x, 3), z3 = Math.pow(z, 3);

	y = y3 > 0.008856 ? y3 : ( y - 16 / 116 ) / 7.787;
	x = x3 > 0.008856 ? x3 : ( x - 16 / 116 ) / 7.787;
	z = z3 > 0.008856 ? z3 : ( z - 16 / 116 ) / 7.787;

	return {
		x : _refX * x,
		y : _refY * y,
		z : _refZ * z
	}
}
