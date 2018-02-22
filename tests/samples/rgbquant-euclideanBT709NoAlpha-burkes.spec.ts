import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 32;
const file = 'frymire.png';
const distance = new iq.distance.EuclideanBT709NoAlpha();
const palette = new iq.palette.RGBQuant(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.Burkes);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-Burkes, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
