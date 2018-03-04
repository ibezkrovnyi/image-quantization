/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * helper.ts - part of Image Quantization Library
 */
import * as distance from './distance';
import * as image from './image';
import * as palette from './palette';
import { AbstractPaletteQuantizer } from './palette/paletteQuantizer';
import { AbstractDistanceCalculator } from './distance/distanceCalculator';
import { AbstractImageQuantizer } from './image/imageQuantizer';
import { PointContainer } from './utils/pointContainer';
import { Palette } from './utils/palette';
import { ssim } from './quality/ssim';

export const enum ColorDistanceFormula {
  CIE94Textiles = 'cie94-textiles',
  CIE94GraphicArts = 'cie94-graphic-arts',
  CIEDE2000 = 'ciede2000',
  CMetric = 'color-metric',
  Euclidean = 'euclidean',
  EuclideanBT709NoAlpha = 'euclidean-bt709-noalpha',
  EuclideanBT709 = 'euclidean-bt709',
  Manhattan = 'manhattan',
  ManhattanBT709 = 'manhattan-bt709',
  ManhattanNommyde = 'manhattan-nommyde',
  PNGQuant = 'pngquant',
}

export const enum PaletteQuantization {
  NeuQuant = 'neuquant',
  NeuQuantFloat = 'neuquant-float',
  RGBQuant = 'rgbquant',
  WuQuant = 'wuquant',
}

export const enum ImageQuantization {
  Nearest = 'nearest',
  Riemersma = 'riemersma',
  FloydSteinberg = 'floyd-steinberg',
  FalseFloydSteinberg = 'false-floyd-steinberg',
  Stucki = 'stucki',
  Atkinson = 'atkinson',
  Jarvis = 'jarvis',
  Burkes = 'burkes',
  Sierra = 'sierra',
  TwoSierra = 'two-sierra',
  SierraLite = 'sierra-lite',
}

export function buildPaletteSync(images: PointContainer[], colorDistanceFormula = ColorDistanceFormula.EuclideanBT709, paletteQuantization = PaletteQuantization.NeuQuant, colors = 256) {
  const distanceCalculator = colorDistanceFormulaToColorDistance(colorDistanceFormula);
  const paletteQuantizer = paletteQuantizationToPaletteQuantizer(paletteQuantization, distanceCalculator, colors);
  images.forEach(image => paletteQuantizer.sample(image));
  return paletteQuantizer.quantize();
}

export async function buildPalette(images: PointContainer[], colorDistanceFormula: typeof ColorDistanceFormula[keyof typeof ColorDistanceFormula] = ColorDistanceFormula.EuclideanBT709, paletteQuantization = PaletteQuantization.NeuQuant, colors = 256, onProgress?: (progress: number) => void) {
  return new Promise<Palette>((resolve, reject) => {
    const distanceCalculator = colorDistanceFormulaToColorDistance(colorDistanceFormula);
    const paletteQuantizer = paletteQuantizationToPaletteQuantizer(paletteQuantization, distanceCalculator, colors);
    images.forEach(image => paletteQuantizer.sample(image));

    let palette: Palette;
    let timerId: NodeJS.Timer;
    const iterator = paletteQuantizer.quantizeAsync();
    const next = () => {
      try {
        const result = iterator.next();
        if (result.done) {
          resolve(palette);
        } else {
          if (result.value.palette) palette = result.value.palette;
          if (onProgress) onProgress(result.value.progress);
          timerId = setTimeout(next, 4);
        }
      } catch (error) {
        clearTimeout(timerId);
        reject(error);
      }
    };
    timerId = setTimeout(next, 4);
  });
}

export function applyPaletteSync(image: PointContainer, palette: Palette, colorDistanceFormula = ColorDistanceFormula.EuclideanBT709, imageQuantization = ImageQuantization.FloydSteinberg) {
  const distanceCalculator = colorDistanceFormulaToColorDistance(colorDistanceFormula);
  const imageQuantizer = imageQuantizationToImageQuantizer(imageQuantization, distanceCalculator);
  return imageQuantizer.quantize(image, palette);
}

export async function applyPalette(image: PointContainer, palette: Palette, colorDistanceFormula = ColorDistanceFormula.EuclideanBT709, imageQuantization = ImageQuantization.FloydSteinberg, onProgress?: (progress: number) => void) {
  return new Promise<PointContainer>((resolve, reject) => {
    const distanceCalculator = colorDistanceFormulaToColorDistance(colorDistanceFormula);
    const imageQuantizer = imageQuantizationToImageQuantizer(imageQuantization, distanceCalculator);

    let outPointContainer: PointContainer;
    let timerId: NodeJS.Timer;
    const iterator = imageQuantizer.quantizeAsync(image, palette);
    const next = () => {
      try {
        const result = iterator.next();
        if (result.done) {
          resolve(outPointContainer);
        } else {
          if (result.value.pointContainer) outPointContainer = result.value.pointContainer;
          if (onProgress) onProgress(result.value.progress);
          timerId = setTimeout(next, 4);
        }
      } catch (error) {
        clearTimeout(timerId);
        reject(error);
      }
    };
    timerId = setTimeout(next, 4);
  });
}

function colorDistanceFormulaToColorDistance(colorDistanceFormula: ColorDistanceFormula) {
  switch (colorDistanceFormula) {
    case ColorDistanceFormula.CIE94GraphicArts: return new distance.CIE94GraphicArts();
    case ColorDistanceFormula.CIE94Textiles: return new distance.CIE94Textiles();
    case ColorDistanceFormula.CIEDE2000: return new distance.CIEDE2000();
    case ColorDistanceFormula.CMetric: return new distance.CMetric();
    case ColorDistanceFormula.Euclidean: return new distance.Euclidean();
    case ColorDistanceFormula.EuclideanBT709: return new distance.EuclideanBT709();
    case ColorDistanceFormula.EuclideanBT709NoAlpha: return new distance.EuclideanBT709NoAlpha();
    case ColorDistanceFormula.Manhattan: return new distance.Manhattan();
    case ColorDistanceFormula.ManhattanBT709: return new distance.ManhattanBT709();
    case ColorDistanceFormula.ManhattanNommyde: return new distance.ManhattanNommyde();
    case ColorDistanceFormula.PNGQuant: return new distance.PNGQuant();
    default: throw new Error(`Unknown colorDistanceFormula ${colorDistanceFormula}`);
  }
}

function imageQuantizationToImageQuantizer(imageQuantization: ImageQuantization, distanceCalculator: AbstractDistanceCalculator) {
  switch (imageQuantization) {
    case ImageQuantization.Nearest: return new image.NearestColor(distanceCalculator);
    case ImageQuantization.Riemersma: return new image.ErrorDiffusionRiemersma(distanceCalculator);
    case ImageQuantization.FloydSteinberg: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.FloydSteinberg);
    case ImageQuantization.FalseFloydSteinberg: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.FalseFloydSteinberg);
    case ImageQuantization.Stucki: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.Stucki);
    case ImageQuantization.Atkinson: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.Atkinson);
    case ImageQuantization.Jarvis: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.Jarvis);
    case ImageQuantization.Burkes: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.Burkes);
    case ImageQuantization.Sierra: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.Sierra);
    case ImageQuantization.TwoSierra: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.TwoSierra);
    case ImageQuantization.SierraLite: return new image.ErrorDiffusionArray(distanceCalculator, image.ErrorDiffusionArrayKernel.SierraLite);
    default: throw new Error(`Unknown imageQuantization ${imageQuantization}`);
  }
}

function paletteQuantizationToPaletteQuantizer(paletteQuantization: PaletteQuantization, distanceCalculator: AbstractDistanceCalculator, colors: number) {
  switch (paletteQuantization) {
    case PaletteQuantization.NeuQuant: return new palette.NeuQuant(distanceCalculator, colors);
    case PaletteQuantization.RGBQuant: return new palette.RGBQuant(distanceCalculator, colors);
    case PaletteQuantization.WuQuant: return new palette.WuQuant(distanceCalculator, colors);
    case PaletteQuantization.NeuQuantFloat: return new palette.NeuQuantFloat(distanceCalculator, colors);
    default: throw new Error(`Unknown paletteQuantization ${paletteQuantization}`);
  }
}
