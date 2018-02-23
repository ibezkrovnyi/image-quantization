import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'clegg.png';
const distance = new iq.distance.CIEDE2000();
const palette = new iq.palette.NeuQuant(distance, colors);
const image = new iq.image.NearestColor(distance);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
