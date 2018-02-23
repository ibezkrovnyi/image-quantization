import { getFiles, runTest } from './utils';
import * as iq from '../../src/image-q';

const colors = 64;
const file = 'sail.png';
const distance = new iq.distance.ManhattanBT709();
const palette = new iq.palette.WuQuant(distance, colors);
const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.Sierra);
runTest(
  `file: ${file}, distance: ${distance.constructor.name}, paletteQuantizer: ${palette.constructor.name}, imageQuantizer: ${image.constructor.name}-Sierra, colors: ${colors}`, file, colors, 
  distance,
  palette,
  image,
);
