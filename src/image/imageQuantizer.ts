/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
import { Palette, PointContainer } from '../utils';
import { ImageQuantizerYieldValue } from './imageQuantizerYieldValue';

export abstract class AbstractImageQuantizer {
  abstract quantize(pointContainer: PointContainer, palette: Palette): IterableIterator<ImageQuantizerYieldValue>;

  quantizeSync(pointContainer: PointContainer, palette: Palette) {
    for (const value of this.quantize(pointContainer, palette)) {
      if (value.pointContainer) {
        return value.pointContainer;
      }
    }

    throw new Error('unreachable');
  }
}
