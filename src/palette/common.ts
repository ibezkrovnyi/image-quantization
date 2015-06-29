/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
module IQ.Palette {
	export interface IPaletteQuantizer {
		sample(pointBuffer : Utils.PointContainer) : void;
		quantize() : Utils.Palette;
	}
}
