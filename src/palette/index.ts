/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */
import { AbstractPaletteQuantizer } from './paletteQuantizer';
import { NeuQuant } from './neuquant/neuquant';
import { NeuQuantFloat } from './neuquant/neuquantFloat';
import { RGBQuant } from './rgbquant/rgbquant';
import { ColorHistogram } from './rgbquant/colorHistogram';
import { WuQuant, WuColorCube } from './wu/wuQuant';
import { PaletteQuantizerYieldValue } from './paletteQuantizerYieldValue';

export {
  AbstractPaletteQuantizer,
  PaletteQuantizerYieldValue,

  NeuQuant,
  NeuQuantFloat,
  RGBQuant,
  WuQuant,

  ColorHistogram,
  WuColorCube,
};
