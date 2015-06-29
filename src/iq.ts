/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */

/// <reference path='distance/common.ts' />
/// <reference path='constants.ts' />

/// <reference path='conversion/rgb2xyz.ts' />
/// <reference path='conversion/rgb2hsl.ts' />
/// <reference path='conversion/rgb2lab.ts' />
/// <reference path='conversion/lab2xyz.ts' />
/// <reference path='conversion/lab2rgb.ts' />
/// <reference path='conversion/xyz2lab.ts' />
/// <reference path='conversion/xyz2rgb.ts' />

///<reference path="utils/arithmetic.ts"/>
/// <reference path='distance/common.ts' />
/// <reference path='distance/euclidean.ts' />
/// <reference path='distance/euclideanRgbQuantWOAlpha.ts' />
/// <reference path='distance/euclideanRgbQuantWithAlpha.ts' />
/// <reference path='distance/manhattan.ts' />
/// <reference path='distance/manhattanSRGB.ts' />
/// <reference path='distance/cie94.ts' />
/// <reference path='distance/ciede2000.ts' />
/// <reference path='distance/ciede2000_original.ts' />
/// <reference path='distance/cmetric.ts' />
/// <reference path='distance/pngQuant.ts' />

/// <reference path='utils/point.ts' />
/// <reference path='utils/palette.ts' />
/// <reference path='utils/pointContainer.ts' />
/// <reference path='utils/hueStatistics.ts' />

/// <reference path='image/common.ts' />
/// <reference path='image/array.ts' />
/// <reference path='image/riemersma.ts' />
/// <reference path='image/nearestColor.ts' />

/// <reference path="palette/common.ts"/>
/// <reference path="palette/neuquant/neuquant.ts"/>
/// <reference path="palette/neuquant/neuquant-float.ts"/>
/// <reference path="palette/rgbquant/rgbquant.ts"/>
/// <reference path="palette/wu/wuQuant.ts"/>

/// <reference path="quality/ssim.ts"/>

/// <reference path='utils/utils.ts' />
var d = new IQ.Distance.CIEDE2000();
var d2 = new IQ.Distance.CIEDE2000_Original();
var r1 = 0,
	g1 = 0,
	b1 = 0,
	a1 = 0,
	r2 = 0,
	g2 = 0,
	b2 = 0,
	a2 = 0;

/*
 for(var i = 0; i <= 255; i++) {
 console.log(
 i,
 d.calculateRaw(r1, g1, b1, a1, i, g2, b2, a2),
 d.calculateRaw(r1, g1, b1, a1, r2, i, b2, a2),
 d.calculateRaw(r1, g1, b1, a1, r2, g2, i, a2)
 );
 }
 */
console.log(
	d.calculateRaw(0, 0, 0, 0, 127, 13, 65, 0),
	d.calculateRaw(0, 0, 0, 0, 22, 255, 11, 0),
	d.calculateRaw(22, 255, 11, 0, 127, 13, 65, 0)
);
console.log(
	d2.calculateRaw(0, 0, 0, 0, 127, 13, 65, 0),
	d2.calculateRaw(0, 0, 0, 0, 22, 255, 11, 0),
	d2.calculateRaw(22, 255, 11, 0, 127, 13, 65, 0)
);
