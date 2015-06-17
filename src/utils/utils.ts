/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * utils.ts - part of Image Quantization Library
 */
module IQ.Utils {

	// test if js engine's Array#sort implementation is stable
/*
	function isArrSortStable() {
		var str = "abcdefghijklmnopqrstuvwxyz";

		var result = "xyzvwtursopqmnklhijfgdeabc" == str.split("").sort(function (a, b) {
				return ~~(str.indexOf(b) / 2.3) - ~~(str.indexOf(a) / 2.3);
			}).join("");

		return result;
	}

*/
	// TODO: move to separate file like "utils.ts" - it is used by colorQuant too!
	export function typeOf(val) {
		return Object.prototype.toString.call(val).slice(8, -1);
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

	//export var sort = isArrSortStable() ? Array.prototype.sort : stableSort;

	// must be used via stableSort.call(arr, fn)
/*
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
*/

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
/*
	export function sortedHashKeys(obj, desc) {
		var keys = Object.keys(obj);
		if (desc) {
			var k = sort.call(keys, function (a, b) {
				return obj[b] - obj[a];
			});
			return k;

		} else {
			return sort.call(keys, function (a, b) {
				return obj[a] - obj[b];
			});
		}
	}
*/
}
