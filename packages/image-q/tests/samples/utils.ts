import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import * as iq from '../../src';
import { PointContainer } from '../../src/utils';

export function getFiles() {
  const dir = path.join(__dirname, 'images');
  return fs
    .readdirSync(dir)
    .filter((file) => {
      return /\.png$/.test(file);
    })
    .reduce((prev, file) => {
      const decoded = decodePng(path.join(dir, file));
      prev[file] = {
        decoded,
        pointContainer: iq.utils.PointContainer.fromBuffer(
          decoded.data,
          decoded.width,
          decoded.height,
        ),
      };
      return prev;
    }, {} as Record<string, {
      decoded: PNG,
      pointContainer: PointContainer,
    }>);
}

const getFile = (file: string) => {
  const dir = path.join(__dirname, 'images');
  const decoded = decodePng(path.join(dir, file));
  return {
    decoded,
    pointContainer: iq.utils.PointContainer.fromBuffer(
      decoded.data,
      decoded.width,
      decoded.height,
    ),
  };
};

function decodePng(path: string) {
  const buffer = fs.readFileSync(path);
  return PNG.sync.read(buffer);
}

export function runTest(
  title: string,
  file: string,
  _colors: unknown,
  _distanceC: iq.distance.AbstractDistanceCalculator,
  paletteQ: iq.palette.AbstractPaletteQuantizer,
  imageQ: iq.image.AbstractImageQuantizer,
) {
  test(title, function () {
    const { pointContainer } = getFile(file);

    paletteQ.sample(pointContainer);

    const generator = paletteQ.quantize();
    const runGenerator = () => {
      const { done, value } = generator.next();
      if (done) {
        // resolve();
        return;
      }
      if (value.palette) {
        const outPointContainer = imageQ.quantizeSync(
          pointContainer,
          value.palette,
        );
        const outData = outPointContainer.toUint8Array();
        expect(outData).toMatchSnapshot();
      }
      // process.nextTick(runGenerator);
      runGenerator();
    };
    runGenerator();
  });
}
