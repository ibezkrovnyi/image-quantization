/*
 * Copyright (c) 2015, Leon Sorokin
 * All rights reserved. (MIT Licensed)
 *
 * RgbQuant.js - an image quantization lib
 */

/**
 * @preserve TypeScript port:
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * rgbquant.ts - part of Image Quantization Library
 */

import {Palette} from "../../utils/palette"
import {Point} from "../../utils/point"
import {PointContainer} from "../../utils/pointContainer"
import {IDistanceCalculator} from "../../distance/common"
import {ColorHistogram} from "./colorHistogram"
import {IPaletteQuantizer} from "../common"
import {stableSort} from "../../utils/arithmetic"

class RemovedColor {
	index : number;
	color : Point;
	distance : number;

	constructor(index : number, color : Point, distance : number) {
		this.index    = index;
		this.color    = color;
		this.distance = distance;
	}
}

// TODO: make input/output image and input/output palettes with instances of class Point only!
export class RGBQuant implements IPaletteQuantizer {
	// desired final palette size
	private _colors : number;

	// color-distance threshold for initial reduction pass
	private _initialDistance : number;

	// subsequent passes threshold
	private _distanceIncrement : number;

	// accumulated histogram
	private _histogram : ColorHistogram;
	private _distance : IDistanceCalculator;

	constructor(colorDistanceCalculator : IDistanceCalculator, colors : number = 256, method : number = 2) {
		this._distance = colorDistanceCalculator;
		// desired final palette size
		this._colors   = colors;

		// histogram to accumulate
		this._histogram = new ColorHistogram(method, colors);

		this._initialDistance   = 0.01;
		this._distanceIncrement = 0.005;
	}

	// gathers histogram info
	sample(image : PointContainer) : void {
		/*
		 var pointArray = image.getPointArray(), max = [0, 0, 0, 0], min = [255, 255, 255, 255];

		 for (var i = 0, l = pointArray.length; i < l; i++) {
		 var color = pointArray[i];
		 for (var componentIndex = 0; componentIndex < 4; componentIndex++) {
		 if (max[componentIndex] < color.rgba[componentIndex]) max[componentIndex] = color.rgba[componentIndex];
		 if (min[componentIndex] > color.rgba[componentIndex]) min[componentIndex] = color.rgba[componentIndex];
		 }
		 }
		 var rd = max[0] - min[0], gd = max[1] - min[1], bd = max[2] - min[2], ad = max[3] - min[3];
		 this._distance.setWhitePoint(rd, gd, bd, ad);

		 this._initialDistance = (Math.sqrt(rd * rd + gd * gd + bd * bd + ad * ad) / Math.sqrt(255 * 255 + 255 * 255 + 255 * 255)) * 0.01;
		 */

		this._histogram.sample(image);
	}

	// reduces histogram to palette, remaps & memoizes reduced colors
	quantize() : Palette {
		var idxi32  = this._histogram.getImportanceSortedColorsIDXI32()
		if(!idxi32) {
			throw new Error("No colors in image")
		}

		var palette = this._buildPalette(idxi32);

		palette.sort();
		return palette;
	}

	// reduces similar colors from an importance-sorted Uint32 rgba array
	private _buildPalette(idxi32 : number[]) : Palette {
		// reduce histogram to create initial palette
		// build full rgb palette
		var palette    = new Palette(),
			colorArray = palette.getPointContainer().getPointArray(),
			usageArray = new Array(idxi32.length);

		for (var i = 0; i < idxi32.length; i++) {
			colorArray.push(Point.createByUint32(idxi32[ i ]));
			usageArray[ i ] = 1;
		}

		var len                      = colorArray.length,
			palLen                   = len,
			thold                    = this._initialDistance,
			memDist : RemovedColor[] = [];

		// palette already at or below desired length
		while (palLen > this._colors) {
			memDist.length = 0;

			// iterate palette
			for (var i = 0; i < len; i++) {
				if (usageArray[ i ] === 0) continue;
				var pxi = colorArray[ i ];
				//if (!pxi) continue;

				for (var j = i + 1; j < len; j++) {
					if (usageArray[ j ] === 0) continue;
					var pxj = colorArray[ j ];
					//if (!pxj) continue;

					var dist = this._distance.calculateNormalized(pxi, pxj);
					if (dist < thold) {
						// store index,rgb,dist
						memDist.push(new RemovedColor(j, pxj, dist));
						usageArray[ j ] = 0;
						palLen--;
					}
				}
			}
			// palette reduction pass
			// console.log("palette length: " + palLen);

			// if palette is still much larger than target, increment by larger initDist
			thold += (palLen > this._colors * 3) ? this._initialDistance : this._distanceIncrement;
		}

		// if palette is over-reduced, re-add removed colors with largest distances from last round
		if (palLen < this._colors) {
			// sort descending
			stableSort(memDist, function (a : RemovedColor, b : RemovedColor) {
				return b.distance - a.distance;
			});

			var k = 0;
			while (palLen < this._colors && k < memDist.length) {
				var removedColor                 = memDist[ k ];
				// re-inject rgb into final palette
				usageArray[ removedColor.index ] = 1;
				palLen++;
				k++;
			}
		}

		var colors = colorArray.length;
		for (var colorIndex = colors - 1; colorIndex >= 0; colorIndex--) {
			if (usageArray[ colorIndex ] === 0) {
				if (colorIndex !== colors - 1) {
					colorArray[ colorIndex ] = colorArray[ colors - 1 ];
				}
				--colors;
			}
		}
		colorArray.length = colors;

		return palette;
	}

}

