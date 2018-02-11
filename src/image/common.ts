/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
import { PointContainer } from '../utils/pointContainer';
import { Palette } from '../utils/palette';

export interface ImageQuantizer {
  quantize(pointBuffer: PointContainer, palette: Palette): PointContainer;
}
