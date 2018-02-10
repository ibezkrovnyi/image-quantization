/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */
import { PaletteQuantizer } from './paletteQuantizer';
import { NeuQuant } from './neuquant/neuquant';
import { NeuQuantFloat } from './neuquant/neuquantFloat';
import { RGBQuant } from './rgbquant/rgbquant';
import { ColorHistogram } from './rgbquant/colorHistogram';
import { WuQuant, WuColorCube } from './wu/wuQuant';
import { PaletteQuantizerYieldValue } from './paletteQuantizerYieldValue';

export {
  PaletteQuantizer,
  PaletteQuantizerYieldValue,

  NeuQuant,
  NeuQuantFloat,
  RGBQuant,
  WuQuant,

  ColorHistogram,
  WuColorCube,
};
