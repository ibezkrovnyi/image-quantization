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
		// TODO: why here another equation??
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
		if (value > high) value = high;
		if (value < low) value = low;
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
}
