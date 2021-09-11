import { runTest } from './utils';
import * as iq from '../../src';

const colors = 64;
const file = 'lena3.png';
const distance = new iq.distance.CMetric();
const palette = new iq.palette.NeuQuantFloat(distance, colors);
const image = new iq.image.ErrorDiffusionArray(
  distance,
  iq.image.ErrorDiffusionArrayKernel.Stucki,
);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-Stucki, colors: ${colors}`,
  file,
  colors,
  distance,
  palette,
  image,
);
