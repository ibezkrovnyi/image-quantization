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
	export function hueGroup(hue, segmentsNumber) {
		var maxHue = 360,
			seg = maxHue / segmentsNumber,
			half = seg / 2;

		for (var i = 1, mid = seg - half; i < segmentsNumber; i++, mid+=seg) {
			if (hue >= mid && hue < mid + seg) return i;
		}
		return 0;
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
