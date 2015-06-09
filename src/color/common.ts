/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
module IQ.Color {
	export interface IDistanceCalculator {
		setMaximalColorDeltas(maxRedDelta: number, maxGreenDelta: number, maxBlueDelta: number, maxAlphaDelta: number): void;
		calculateRaw(r1: number, g1: number, b1: number, a1: number, r2: number, g2: number, b2: number, a2: number): number;
		calculateNormalized(colorA : Utils.Point, colorB : Utils.Point): number;
	}
}
