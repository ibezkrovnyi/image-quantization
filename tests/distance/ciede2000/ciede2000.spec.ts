import { data as dataInLab } from './dataInLab';
import { conversion, distance, utils } from '../../../src/image-q';

describe(`CIEDE2000`, function () {
  const ciede2000 = new (distance.CIEDE2000)();
  ciede2000.setWhitePoint(255, 255, 255, 0);
  doTests(ciede2000);
});

function doTests(ciede2000) {
  describe('color distance should be correctly calculated (Lab)', function () {
    dataInLab.forEach(item => {
      test(`Colors: Lab1 = ${dir(item.Lab1)}, Lab2 = ${dir(item.Lab2)}`, function () {
        const raw = ciede2000.calculateRawInLab(item.Lab1, item.Lab2);
        const dE = Number(Math.sqrt(raw).toFixed(4));

        expect(dE).toEqual(item.distance);
      });
    })
  });

  describe('normalized distance should be less than 1', function () {
    dataInLab.forEach(item => {
      const rgb1 = conversion.lab2rgb(item.Lab1.L, item.Lab1.a, item.Lab1.b);
      const rgb2 = conversion.lab2rgb(item.Lab2.L, item.Lab2.a, item.Lab2.b);
      const point1 = utils.Point.createByRGBA(rgb1.r, rgb1.g, rgb1.b, 0);
      const point2 = utils.Point.createByRGBA(rgb2.r, rgb2.g, rgb2.b, 0);

      test(`Colors: Lab1 = ${dir(item.Lab1)}, Lab2 = ${dir(item.Lab2)}`, function () {
        const normalized = ciede2000.calculateNormalized(point1, point2);
        expect(normalized).toBeLessThanOrEqual(1);
        // console.log(normalized)
      });
    })
  });
}

function dir(obj) {
  return JSON.stringify(obj);
}
