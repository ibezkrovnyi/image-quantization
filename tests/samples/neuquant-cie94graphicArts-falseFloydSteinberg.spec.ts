import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'lena3.png';
const distance = new iq.distance.CIE94GraphicArts();
const palette = new iq.palette.NeuQuant(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.FalseFloydSteinberg);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-FalseFloydSteinberg, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
