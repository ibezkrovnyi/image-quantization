/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * palette.ts - part of Image Quantization Library
 */

/// <reference path='point.ts' />
///<reference path="../palette/rgbquant/colorHistogram.ts"/>
// TODO: make paletteArray via pointBuffer, so, export will be available via pointBuffer.exportXXX
module IQ.Utils {

	var hueGroups : number = 10;

	export class Palette {
		private _pointContainer : PointContainer;
		private _pointArray : Point[] = [];
		private _i32idx : { [ key: string ] : number } = {};

		constructor() {
			this._pointContainer = new PointContainer();
			this._pointContainer.setHeight(1);
			this._pointArray = this._pointContainer.getPointArray();
		}

		public add(color : Point) {
			this._pointArray.push(color);
			this._pointContainer.setWidth(this._pointArray.length);
		}

		public has(color : Point) {
			for(var i = this._pointArray.length - 1; i >= 0; i--) {
				if(color.uint32 === this._pointArray[i].uint32) return true;
			}

			return false;
		}

		// TOTRY: use HUSL - http://boronine.com/husl/ http://www.husl-colors.org/ https://github.com/husl-colors/husl
		public getNearestColor(colorDistanceCalculator : Distance.IDistanceCalculator, color : Point) : Point {
			return this._pointArray[this.getNearestIndex(colorDistanceCalculator, color) | 0];
		}

		public getPointContainer() : PointContainer {
			return this._pointContainer;
		}

		// TOTRY: use HUSL - http://boronine.com/husl/
/*
		public nearestIndexByUint32(i32) {
			var idx : number = this._nearestPointFromCache("" + i32);
			if (idx >= 0) return idx;

			var min = 1000,
				rgb = [
					(i32 & 0xff),
					(i32 >>> 8) & 0xff,
					(i32 >>> 16) & 0xff,
					(i32 >>> 24) & 0xff
				],
				len = this._pointArray.length;

			idx = 0;
			for (var i = 0; i < len; i++) {
				var dist = Utils.distEuclidean(rgb, this._pointArray[i].rgba);

				if (dist < min) {
					min = dist;
					idx = i;
				}
			}

			this._i32idx[i32] = idx;
			return idx;
		}
*/

		private _nearestPointFromCache(key) {
			return typeof this._i32idx[key] === "number" ? this._i32idx[key] : -1;
		}

		private getNearestIndex(colorDistanceCalculator : Distance.IDistanceCalculator, point : Point) : number {
			var idx : number = this._nearestPointFromCache("" + point.uint32);
			if (idx >= 0) return idx;

			var minimalDistance : number = Number.MAX_VALUE/*,
				low :Point = null,
				high :Point = null*/;

			for (var idx = 0, i = 0, l = this._pointArray.length; i < l; i++) {
				var p = this._pointArray[i];
/*
				// TODO: the optimization below gives from 10% to 5% performance gain. Do we need it at all?
					isHigher = point.r <= p.r && point.g <= p.g && point.b <= p.b && point.a <= p.a,
					isLower = point.r > p.r && point.g > p.g && point.b > p.b && point.a > p.a;

				if(isLower && low && low.r > p.r && low.g > p.g && low.b > p.b && low.a > p.a ) {
					continue;
				}

				if(isHigher && high && high.r <= p.r && high.g <= p.g && high.b <= p.b && high.a <= p.a ) {
					continue;
				}

				if(isHigher) {
					high = p;
				}

				if(isLower) {
					low = p;
				}
*/

				var distance = colorDistanceCalculator.calculateRaw(point.r, point.g, point.b, point.a, p.r, p.g, p.b, p.a);
				if (distance < minimalDistance) {
					minimalDistance = distance;
					idx = i;
				}
			}

			this._i32idx[point.uint32] = idx;
			return idx;
		}

/*
		public reduce(histogram : ColorHistogram, colors : number) {
			if (this._pointArray.length > colors) {
				var idxi32 = histogram.getImportanceSortedColorsIDXI32();

				// quantize histogram to existing palette
				var keep = [], uniqueColors = 0, idx, pruned = false;

				for (var i = 0, len = idxi32.length; i < len; i++) {
					// palette length reached, unset all remaining colors (sparse palette)
					if (uniqueColors >= colors) {
						this.prunePal(keep);
						pruned = true;
						break;
					} else {
						idx = this.nearestIndexByUint32(idxi32[i]);
						if (keep.indexOf(idx) < 0) {
							keep.push(idx);
							uniqueColors++;
						}
					}
				}

				if (!pruned) {
					this.prunePal(keep);
				}
			}
		}

		// TODO: check usage, not tested!
		public prunePal(keep : number[]) {
			var colors = this._pointArray.length;
			for (var colorIndex = colors - 1; colorIndex >= 0; colorIndex--) {
				if (keep.indexOf(colorIndex) < 0) {

					if(colorIndex + 1 < colors) {
						this._pointArray[ colorIndex ] = this._pointArray [ colors - 1 ];
					}
					--colors;
					//this._pointArray[colorIndex] = null;
				}
			}
			console.log("colors pruned: " + (this._pointArray.length - colors));
			this._pointArray.length = colors;
			this._i32idx = {};
		}
*/

		// TODO: group very low lum and very high lum colors
		// TODO: pass custom sort order
		// TODO: sort criteria function should be placed to HueStats class
		public sort() {
			this._i32idx = {};
			this._pointArray.sort((a : Point, b : Point) => {
				var hslA = Conversion.rgb2hsl(a.r, a.g, a.b),
					hslB = Conversion.rgb2hsl(b.r, b.g, b.b);

				// sort all grays + whites together
				var hueA = (a.r === a.g && a.g === a.b) ? 0 : 1 + Utils.hueGroup(hslA.h, hueGroups);
				var hueB = (b.r === b.g && b.g === b.b) ? 0 : 1 + Utils.hueGroup(hslB.h, hueGroups);
/*
				var hueA = (a.r === a.g && a.g === a.b) ? 0 : 1 + Utils.hueGroup(hslA.h, hueGroups);
				var hueB = (b.r === b.g && b.g === b.b) ? 0 : 1 + Utils.hueGroup(hslB.h, hueGroups);
*/

				var hueDiff = hueB - hueA;
				if (hueDiff) return -hueDiff;

/*
				var lumDiff = Utils.lumGroup(+hslB.l.toFixed(2)) - Utils.lumGroup(+hslA.l.toFixed(2));
				if (lumDiff) return -lumDiff;
*/
                var lA = a.getLuminosity(true),
                    lB = b.getLuminosity(true);

                if(lB - lA !== 0) return lB - lA;

				var satDiff = ((hslB.s * 100) | 0) - ((hslA.s * 100) | 0);
				if (satDiff) return -satDiff;

			});
		}
	}
}
