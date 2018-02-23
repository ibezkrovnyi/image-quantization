import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'lena3.png';
const distance = new iq.distance.ManhattanNommyde();
const palette = new iq.palette.NeuQuantFloat(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-SierraLite, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
