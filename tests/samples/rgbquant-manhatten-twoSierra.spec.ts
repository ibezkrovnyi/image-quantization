import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'frymire.png';
const distance = new iq.distance.Manhattan();
const palette = new iq.palette.RGBQuant(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.TwoSierra);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-TwoSierra, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
