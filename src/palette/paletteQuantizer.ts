/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
import { PointContainer } from '../utils/pointContainer';
import { Palette } from '../utils/palette';
import { PaletteQuantizerYieldValue } from './paletteQuantizerYieldValue';

export abstract class PaletteQuantizer {
  abstract sample(pointBuffer: PointContainer): void;
  abstract quantizeAsync(): IterableIterator<PaletteQuantizerYieldValue>;

  quantize(): Palette {
    for (const value of this.quantizeAsync()) {
      if (value.palette) {
        return value.palette;
      }
    }

    throw new Error('unreachable');
  }
}
