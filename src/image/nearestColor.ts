/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * nearestColor.ts - part of Image Quantization Library
 */
import {IImageDitherer} from "./common"
import {IDistanceCalculator} from "../distance/common"
import {PointContainer} from "../utils/pointContainer"
import {Palette} from "../utils/palette"

export class NearestColor implements IImageDitherer {
	private _distance : IDistanceCalculator;

	constructor(colorDistanceCalculator : IDistanceCalculator) {
		this._distance = colorDistanceCalculator;
	}

	quantize(pointBuffer : PointContainer, palette : Palette) : PointContainer {
		var pointArray = pointBuffer.getPointArray(),
			width      = pointBuffer.getWidth(),
			height     = pointBuffer.getHeight();

		for (var y = 0; y < height; y++) {
			for (var x = 0, idx = y * width; x < width; x++, idx++) {
				// Image pixel
				var point = pointArray[ idx ];
				// Reduced pixel
				point.from(palette.getNearestColor(this._distance, point));
			}
		}
		return pointBuffer;
	}
}


