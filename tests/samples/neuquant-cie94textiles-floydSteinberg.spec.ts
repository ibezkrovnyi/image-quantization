import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'clegg.png';
const distance = new iq.distance.CIE94Textiles();
const palette = new iq.palette.NeuQuant(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.FloydSteinberg);
runTest(
  `file: ${file}, distance: ciede2000, paletteQuantizer: NeuQuant, imageQuantizer: FloydSteinberg, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
