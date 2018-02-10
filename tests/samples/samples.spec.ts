import { getListOfFiles } from './tiff-reader';
import * as iq from '../../src/image-q';

const files = getListOfFiles();

describe('samples', function () {
  files.forEach(file => {
    test(`neoquant, file: ${file.fileName}`, () => {
      const decoded = file.decoded;

      const distance = new iq.distance.EuclideanRgbQuantWOAlpha();
      const inPointContainer = iq.utils.PointContainer.fromUint8Array(decoded.data, decoded.width, decoded.height);

      // palette
      const iqPalette = new iq.palette.NeuQuant(distance, 128);
      iqPalette.sample(inPointContainer);
      const palette = iqPalette.quantize();

      // image
      const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite);
      const outPointContainer = image.quantize(inPointContainer, palette);

      // write PNG using pngjs
      const outData = outPointContainer.toUint8Array();
      expect(outData).toMatchSnapshot();
    });
  });

  files.forEach(file => {
    test(`neoquant (float), file: ${file.fileName}`, () => {
      const decoded = file.decoded;

      const distance = new iq.distance.EuclideanRgbQuantWOAlpha();
      const inPointContainer = iq.utils.PointContainer.fromUint8Array(decoded.data, decoded.width, decoded.height);

      // palette
      const iqPalette = new iq.palette.NeuQuantFloat(distance, 128);
      iqPalette.sample(inPointContainer);
      const palette = iqPalette.quantize();

      // image
      const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite);
      const outPointContainer = image.quantize(inPointContainer, palette);

      // write PNG using pngjs
      const outData = outPointContainer.toUint8Array();
      expect(outData).toMatchSnapshot();
    });
  });

  files.forEach(file => {
    test(`wuquant, file: ${file.fileName}`, () => {
      const decoded = file.decoded;

      const distance = new iq.distance.EuclideanRgbQuantWOAlpha();
      const inPointContainer = iq.utils.PointContainer.fromUint8Array(decoded.data, decoded.width, decoded.height);

      // palette
      const iqPalette = new iq.palette.WuQuant(distance, 128);
      iqPalette.sample(inPointContainer);
      const palette = iqPalette.quantize();

      // image
      const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite);
      const outPointContainer = image.quantize(inPointContainer, palette);

      // write PNG using pngjs
      const outData = outPointContainer.toUint8Array();
      expect(outData).toMatchSnapshot();
    });
  });
  
  files.forEach(file => {
    test(`rgbquant, file: ${file.fileName}`, () => {
      const decoded = file.decoded;

      const distance = new iq.distance.EuclideanRgbQuantWOAlpha();
      const inPointContainer = iq.utils.PointContainer.fromUint8Array(decoded.data, decoded.width, decoded.height);

      // palette
      const iqPalette = new iq.palette.RGBQuant(distance, 128);
      iqPalette.sample(inPointContainer);
      const palette = iqPalette.quantize();

      // image
      const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite);
      const outPointContainer = image.quantize(inPointContainer, palette);

      // write PNG using pngjs
      const outData = outPointContainer.toUint8Array();
      expect(outData).toMatchSnapshot();
    });
  });
});
