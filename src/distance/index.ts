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
import { AbstractEuclidean, Euclidean, EuclideanRGBQuantWOAlpha, EuclideanRGBQuantWithAlpha } from './euclidean';
import { AbstractManhattan, Manhattan, ManhattanSRGB, ManhattanNommyde } from './manhattan';
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
  EuclideanRGBQuantWithAlpha,
  EuclideanRGBQuantWOAlpha,

  AbstractManhattan,
  Manhattan,
  ManhattanSRGB,
  ManhattanNommyde,
};
