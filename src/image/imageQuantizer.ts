/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
import { PointContainer } from '../utils/pointContainer';
import { Palette } from '../utils/palette';
import { ImageQuantizerYieldValue } from './imageQuantizerYieldValue';

export abstract class ImageQuantizer {
  abstract quantizeAsync(pointContainer: PointContainer, palette: Palette): IterableIterator<ImageQuantizerYieldValue>;

  quantize(pointContainer: PointContainer, palette: Palette) {
    for (const value of this.quantizeAsync(pointContainer, palette)) {
      if (value.pointContainer) {
        return value.pointContainer;
      }
    }

    throw new Error('unreachable');
  }
}
