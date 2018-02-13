/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * common.ts - part of Image Quantization Library
 */
import { PointContainer } from '../utils/pointContainer';
import { Palette } from '../utils/palette';
import { PaletteQuantizerYieldValue } from './paletteQuantizerYieldValue';

export abstract class AbstractPaletteQuantizer {
  abstract sample(pointContainer: PointContainer): void;
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
