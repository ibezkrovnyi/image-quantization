/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
module IQ.Image {
	export interface IImageDitherer {
		quantize(pointBuffer : Utils.PointContainer, palette : Utils.Palette) : Utils.PointContainer;
	}
}
