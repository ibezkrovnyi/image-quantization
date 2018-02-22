import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'clegg.png';
const distance = new iq.distance.EuclideanBT709();
const palette = new iq.palette.RGBQuant(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.Jarvis);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-Jarvis, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
