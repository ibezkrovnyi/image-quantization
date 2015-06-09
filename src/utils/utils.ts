/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * utils.ts - part of Image Quantization Library
 */
module IQ.Utils {

	// Rec. 709 (sRGB) luma coef
	var Pr = .2126,
		Pg = .7152,
		Pb = .0722,
		Pa = 1; // TODO: (igor-bezkrovny) what should be here?

	// test if js engine's Array#sort implementation is stable
	function isArrSortStable() {
		var str = "abcdefghijklmnopqrstuvwxyz";

		return "xyzvwtursopqmnklhijfgdeabc" == str.split("").sort(function (a, b) {
				return ~~(str.indexOf(b) / 2.3) - ~~(str.indexOf(a) / 2.3);
			}).join("");
	}

	// TODO: move to separate file like "utils.ts" - it is used by colorQuant too!
	export function typeOf(val) {
		return Object.prototype.toString.call(val).slice(8, -1);
	}

	// http://alienryderflex.com/hsp.html
	export function rgb2lum(r, g, b) {
		// TODO: luma = point.r * RED_COEFFICIENT + point.g * GREEN_COEFFICIENT + point.b * BLUE_COEFFICIENT
		// TODO: why here another formula??
		return Math.sqrt(
			Pr * r * r +
			Pg * g * g +
			Pb * b * b
		);
	}

	export function max3(a,b,c) {
		var m = a;
		(m < b) && (m = b);
		(m < c) && (m = c);
		return m;
	}

	export function min3(a,b,c) {
		var m = a;
		(m > b) && (m = b);
		(m > c) && (m = c);
		return m;
	}

	export function intInRange(value, low, high) {
		(value > high) && (value = high);
		(value < low) && (value = low);
		return value | 0;
	}
	// http://rgb2hsl.nichabi.com/javascript-function.php
	export function rgb2hsl(r, g, b) {
		var max, min, h, s, l, d;
		r /= 255;
		g /= 255;
		b /= 255;
		max = max3(r, g, b);
		min = min3(r, g, b);
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
			h : h,
			s : s,
			l : rgb2lum(r, g, b)
		};
	}

	export function hueGroup(hue, segs) {
		var seg = 1 / segs,
			haf = seg / 2;

		if (hue >= 1 - haf || hue <= haf)
			return 0;

		for (var i = 1; i < segs; i++) {
			var mid = i * seg;
			if (hue >= mid - haf && hue <= mid + haf)
				return i;
		}
	}

	export var sort = isArrSortStable() ? Array.prototype.sort : stableSort;

	// must be used via stableSort.call(arr, fn)
	export function stableSort(fn) {
		var type = typeOf(this[0]);

		if (type == "Number" || type == "String") {
			var ord = {}, len = this.length, val;

			for (var i = 0; i < len; i++) {
				val = this[i];
				if (ord[val] || ord[val] === 0) continue;
				ord[val] = i;
			}

			return this.sort(function (a, b) {
				return fn(a, b) || ord[a] - ord[b];
			});
		}
		else {
			var ord2 = this.map(function (v) {
				return v
			});

			return this.sort(function (a, b) {
				return fn(a, b) || ord2.indexOf(a) - ord2.indexOf(b);
			});
		}
	}

	/**
	 * 	partitions a rectangle of width x height into
	 *	array of boxes stepX x stepY (or less)
	 */
	export function makeBoxes(width, height, stepX, stepY) {
		var wrem = width % stepX,
			hrem = height % stepY,
			xend = width - wrem,
			yend = height - hrem;

		var boxesArray = [];
		for (var y = 0; y < height; y += stepY)
			for (var x = 0; x < width; x += stepX)
				boxesArray.push({x : x, y : y, w : (x == xend ? wrem : stepX), h : (y == yend ? hrem : stepY)});

		return boxesArray;
	}

	// returns array of hash keys sorted by their values
	export function sortedHashKeys(obj, desc) {
		var keys = Object.keys(obj);
		if (desc) {
			return sort.call(keys, function (a, b) {
				return obj[b] - obj[a];
			});
		} else {
			return sort.call(keys, function (a, b) {
				return obj[a] - obj[b];
			});
		}
	}

	/*
	 * Computes CIE94 distance between 2 colors in LAB space.
	 *
	 * p1 = [l1, a1, b1]
	 * p2 = [l2, a2, b2]
	 * Returns distance:float
	 *
	 * Usage example:
	 *     var d = CIE94_dist([94.0, -0.1, -0.55], [77.0, 0.5, 0.45])
	 *
	 * Iulius Curt, april 2013
	 */

/*
	export function CIE94Distance(colorA : Point, colorB : Point) {

		 //var xyzA = rgb2xyz(colorA.r, colorA.g, colorA.b);
		 //var labA = xyz2lab(xyzA.x, xyzA.y, xyzA.z);
		 //
		 //var xyzB = rgb2xyz(colorB.r, colorB.g, colorB.b);
		 //var labB = xyz2lab(xyzB.x, xyzB.y, xyzB.z);

		var labA = colorA.lab,
			labB = colorB.lab;

		var Kl = 2.0, K1 = 0.048, K2 = 0.014;

		var dL     = labA.l - labB.l,
			dA     = labA.a - labB.a,
			dB     = labA.b - labB.b,
			c1     = Math.sqrt(labA.a * labA.a + labA.b * labA.b),
			c2     = Math.sqrt(labB.a * labB.a + labB.b * labB.b),
			dC     = c1 - c2,
			deltaH = dA * dA + dB * dB - dC * dC;

		deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

		var i = Math.pow(dL / Kl, 2) + Math.pow(dC / (1.0 + K1 * c1), 2) + Math.pow(deltaH / (1.0 + K2 * c1), 2);
		return i < 0 ? 0 : Math.sqrt(i) / 200;
	}
*/

	/*
	 var maxEuclideanDistance = Pr * rd + Pg * gd + Pb * bd + Pa * ad;
	 // perceptual Euclidean color distance
	 export function distEuclidean(rgb0, rgb1) {
	 var rd = rgb1[ 0 ] - rgb0[ 0 ],
	 gd = rgb1[ 1 ] - rgb0[ 1 ],
	 bd = rgb1[ 2 ] - rgb0[ 2 ],
	 ad = rgb1[ 3 ] - rgb0[ 3 ];

	 return (Pr * rd + Pg * gd + Pb * bd + Pa * ad) / maxEuclideanDistance;
	 }
	 */

	/*
	 var manhMax = Pr * rd + Pg * gd + Pb * bd + Pa * ad;
	 // perceptual Manhattan color distance
	 function distManhattan(rgb0, rgb1) {
	 var rd = Math.abs(rgb1[ 0 ] - rgb0[ 0 ]),
	 gd = Math.abs(rgb1[ 1 ] - rgb0[ 1 ]),
	 bd = Math.abs(rgb1[ 2 ] - rgb0[ 2 ]),
	 ad = Math.abs(rgb1[ 3 ] - rgb0[ 3 ]);

	 return (Pr * rd + Pg * gd + Pb * bd + Pa * ad) / manhMax;
	 }
	 */

	/*
	 Finally, I've found it! After thorough testing and experimentation my conclusions are:

	 The correct way is to calculate maximum possible difference between the two colors.
	 Formulas with any kind of estimated average/typical difference had room for non-linearities.

	 I was unable to find correct formula that calculates the distance without blending RGBA colors with backgrounds.

	 There is no need to take every possible background color into account, only extremes per R/G/B channel, i.e. for red channel:

	 blend both colors with 0 red as background, measure squared difference
	 blend both colors with max red background, measure squared difference
	 take higher of the two.
	 Fortunately blending with "white" and "black" is trivial when you use premultiplied alpha (r = r×a).

	 The complete formula is:
	 max((r?-r?)², (r?-r? - a?+a?)²) +
	 max((g?-g?)², (g?-g? - a?+a?)²) +
	 max((b?-b?)², (b?-b? - a?+a?)²)
	 */
	/*
	 function colordifference_ch(x, y, alphas) {
	 // maximum of channel blended on white, and blended on black
	 // premultiplied alpha and backgrounds 0/1 shorten the formula
	 var black = x - y, // [-255; 255]
	 white = black + alphas; // [-255; 255*2]

	 return Math.max(black * black, white * white); // [0; 255^2 + (255*2)^2]
	 }

	 //var rgbaMax = (255*255 + (255*2) * (255*2)) * 3;
	 var rgbaMax = Math.pow(255 << 1, 2) * 3;

	 function distRGBA(rgb0, rgb1) {
	 /!*
	 var r1 = rgb0[0],
	 g1 = rgb0[1],
	 b1 = rgb0[2],
	 a1 = rgb0[3];

	 var r2 = rgb1[0],
	 g2 = rgb1[1],
	 b2 = rgb1[2],
	 a2 = rgb1[3];

	 var dr = r1 - r2,
	 dg = g1 - g2,
	 db = b1 - b2,
	 da = a1 - a2;

	 return (Math.max(dr << 1, dr - da << 1) +
	 Math.max(dg << 1, dg - da << 1) +
	 Math.max(db << 1, db - da << 1)) / rgbaMax;

	 *!/
	 var alphas = rgb1[ 3 ] - rgb0[ 3 ],
	 dist = colordifference_ch(rgb0[ 0 ], rgb1[ 0 ], alphas) +
	 colordifference_ch(rgb0[ 1 ], rgb1[ 1 ], alphas) +
	 colordifference_ch(rgb0[ 2 ], rgb1[ 2 ], alphas);

	 if (dist > rgbaMax) {
	 console.log(dist);
	 }

	 return dist / rgbaMax;
	 }
	 */



/*



















	/!**
	 * IMPORTS
	 *!/
	var sqrt = Math.sqrt;
	var pow = Math.pow;
	var cos = Math.cos;
	var atan2 = Math.atan2;
	var sin = Math.sin;
	var abs = Math.abs;
	var exp = Math.exp;
	var PI = Math.PI;

	/!**
	 * API FUNCTIONS
	 *!/

	/!**
	 * Returns diff between c1 and c2 using the CIEDE2000 algorithm
	 * @param {labcolor} c1    Should have fields L,a,b
	 * @param {labcolor} c2    Should have fields L,a,b
	 * @return {float}   Difference between c1 and c2
	 *!/
	export function distEuclidean_ciede2000(colorA : Point, colorB : Point) {
		/!**
		 * Implemented as in "The CIEDE2000 Color-Difference Formula:
		 * Implementation Notes, Supplementary Test Data, and Mathematical Observations"
		 * by Gaurav Sharma, Wencheng Wu and Edul N. Dalal.
		 *!/

		// Get L,a,b values for color 1
		var L1 = colorA.lab.l;
		var a1 = colorA.lab.a;
		var b1 = colorA.lab.b;

		// Get L,a,b values for color 2
		var L2 = colorB.lab.l;
		var a2 = colorB.lab.a;
		var b2 = colorB.lab.b;

		// Weight factors
		var kL = 1;
		var kC = 1;
		var kH = 1;

		/!**
		 * Step 1: Calculate C1p, C2p, h1p, h2p
		 *!/
		var C1 = sqrt(pow(a1, 2) + pow(b1, 2)) //(2)
		var C2 = sqrt(pow(a2, 2) + pow(b2, 2)) //(2)

		var a_C1_C2 = (C1+C2)/2.0;             //(3)

		var G = 0.5 * (1 - sqrt(pow(a_C1_C2 , 7.0) /
				(pow(a_C1_C2, 7.0) + pow(25.0, 7.0)))); //(4)

		var a1p = (1.0 + G) * a1; //(5)
		var a2p = (1.0 + G) * a2; //(5)

		var C1p = sqrt(pow(a1p, 2) + pow(b1, 2)); //(6)
		var C2p = sqrt(pow(a2p, 2) + pow(b2, 2)); //(6)

		var hp_f = function(x,y) //(7)
		{
			if(x== 0 && y == 0) return 0;
			else{
				var tmphp = degrees(atan2(x,y));
				if(tmphp >= 0) return tmphp
				else           return tmphp + 360;
			}
		}

		var h1p = hp_f(b1, a1p); //(7)
		var h2p = hp_f(b2, a2p); //(7)

		/!**
		 * Step 2: Calculate dLp, dCp, dHp
		 *!/
		var dLp = L2 - L1; //(8)
		var dCp = C2p - C1p; //(9)

		var dhp_f = function(C1, C2, h1p, h2p) //(10)
		{
			if(C1*C2 == 0)               return 0;
			else if(abs(h2p-h1p) <= 180) return h2p-h1p;
			else if((h2p-h1p) > 180)     return (h2p-h1p)-360;
			else if((h2p-h1p) < -180)    return (h2p-h1p)+360;
			else                         throw(new Error());
		}
		var dhp = dhp_f(C1,C2, h1p, h2p); //(10)
		var dHp = 2*sqrt(C1p*C2p)*sin(radians(dhp)/2.0); //(11)

		/!**
		 * Step 3: Calculate CIEDE2000 Color-Difference
		 *!/
		var a_L = (L1 + L2) / 2.0; //(12)
		var a_Cp = (C1p + C2p) / 2.0; //(13)

		var a_hp_f = function(C1, C2, h1p, h2p) { //(14)
			if(C1*C2 == 0)                                      return h1p+h2p
			else if(abs(h1p-h2p)<= 180)                         return (h1p+h2p)/2.0;
			else if((abs(h1p-h2p) > 180) && ((h1p+h2p) < 360))  return (h1p+h2p+360)/2.0;
			else if((abs(h1p-h2p) > 180) && ((h1p+h2p) >= 360)) return (h1p+h2p-360)/2.0;
			else                                                throw(new Error());
		}
		var a_hp = a_hp_f(C1,C2,h1p,h2p); //(14)
		var T = 1-0.17*cos(radians(a_hp-30))+0.24*cos(radians(2*a_hp))+
			0.32*cos(radians(3*a_hp+6))-0.20*cos(radians(4*a_hp-63)); //(15)
		var d_ro = 30 * exp(-(pow((a_hp-275)/25,2))); //(16)
		var RC = sqrt((pow(a_Cp, 7.0)) / (pow(a_Cp, 7.0) + pow(25.0, 7.0)));//(17)
		var SL = 1 + ((0.015 * pow(a_L - 50, 2)) /
			sqrt(20 + pow(a_L - 50, 2.0)));//(18)
		var SC = 1 + 0.045 * a_Cp;//(19)
		var SH = 1 + 0.015 * a_Cp * T;//(20)
		var RT = -2 * RC * sin(radians(2 * d_ro));//(21)
		var dE = sqrt(pow(dLp /(SL * kL), 2) + pow(dCp /(SC * kC), 2) +
			pow(dHp /(SH * kH), 2) + RT * (dCp /(SC * kC)) *
			(dHp / (SH * kH))); //(22)

		var dA = colorB.a - colorA.a;
		return sqrt(dE*dE + dA * dA);
	}

	/!**
	 * INTERNAL FUNCTIONS
	 *!/
	function degrees(n) { return n*(180/PI); }
	function radians(n) { return n*(PI/180); }
*/

}
