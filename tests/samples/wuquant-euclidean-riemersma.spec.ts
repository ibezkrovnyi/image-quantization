import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'sail.png';
const distance = new iq.distance.Euclidean();
const palette = new iq.palette.WuQuant(distance, colors);
const image = new iq.image.ErrorDiffusionRiemersma(distance);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}, colors: ${colors}`, file, colors, 
  distance, 
  palette, 
  image,
);
