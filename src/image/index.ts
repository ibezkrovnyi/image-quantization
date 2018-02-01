/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */
import { ImageQuantizer } from './common';
import { NearestColor } from './nearestColor';
import { ErrorDiffusionArray, ErrorDiffusionArrayKernel } from './array';
import { ErrorDiffusionRiemersma } from './riemersma';

export {
  ImageQuantizer,
  NearestColor,
  ErrorDiffusionArray,
  ErrorDiffusionArrayKernel,
  ErrorDiffusionRiemersma,
};
