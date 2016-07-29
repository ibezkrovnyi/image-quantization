/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * lab2xyz.ts - part of Image Quantization Library
 */
var _refX : number = 0.95047, //ref_X =  95.047   Observer= 2°, Illuminant = D65
	_refY : number = 1.00000, //ref_Y = 100.000
	_refZ : number = 1.08883; //ref_Z = 108.883

function pivot(n : number) {
	const n3 = Math.pow(n, 3);
	return n3 > 0.008856 ? n3 : ( n - 16 / 116 ) / 7.787
}

export function lab2xyz(L : number, a : number, b : number) : {x : number; y : number; z : number} {
	const y = ( L + 16 ) / 116,
		  x = a / 500 + y,
		  z = y - b / 200;

	return {
		x : _refX * pivot(x),
		y : _refY * pivot(y),
		z : _refZ * pivot(z)
	}
}
