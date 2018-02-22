/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */
import { AbstractDistanceCalculator } from './distanceCalculator';
import { CIE94Textiles, CIE94GraphicArts } from './cie94';
import { CIEDE2000 } from './ciede2000';
import { CMETRIC } from './cmetric';
import { AbstractEuclidean, Euclidean, EuclideanBT709NoAlpha, EuclideanBT709 } from './euclidean';
import { AbstractManhattan, Manhattan, ManhattanBT709, ManhattanNommyde } from './manhattan';
import { PNGQUANT } from './pngQuant';

export {
  AbstractDistanceCalculator,
  CIE94Textiles,
  CIE94GraphicArts,
  CIEDE2000,
  CMETRIC,
  PNGQUANT,

  AbstractEuclidean,
  Euclidean,
  EuclideanBT709,
  EuclideanBT709NoAlpha,

  AbstractManhattan,
  Manhattan,
  ManhattanBT709,
  ManhattanNommyde,
};
