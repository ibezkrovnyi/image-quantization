import { buildPalette, applyPalette, buildPaletteSync, applyPaletteSync, utils, ColorDistanceFormula, PaletteQuantization, ImageQuantization } from '../../src/image-q';

let pointContainer: utils.PointContainer;
beforeEach(function() {
  const width      = 16;
	const height     = 16;
	const imageArray = [];
  for (var i = 0; i < width * height * 4; i++) {
	  imageArray[ i ] = (Math.random() * 256) | 0;
  }
  pointContainer = utils.PointContainer.fromUint8Array(imageArray, width, height);
});

test(`Simple API`, async function () {
  // test async
  let buildPaletteProgressMarks = [];
  const palette = await buildPalette([pointContainer], { onProgress: progress => buildPaletteProgressMarks.push(progress) });
  expect(palette).toBeInstanceOf(utils.Palette);

  let applyPaletteProgressMarks = [];
  const outPointContainer = await applyPalette(pointContainer, palette, { onProgress: progress => applyPaletteProgressMarks.push(progress) });
  expect(outPointContainer).toBeInstanceOf(utils.PointContainer);

  // test sync
  const paletteSync = buildPaletteSync([pointContainer]);
  expect(palette.getPointContainer()).toEqual(paletteSync.getPointContainer());
  const outPointContainerSync = applyPaletteSync(pointContainer, paletteSync);
  expect(outPointContainer).toEqual(outPointContainerSync);

  // test progress notifications
  expect(buildPaletteProgressMarks.length).toBeGreaterThan(0);
  buildPaletteProgressMarks.reduce((prev, cur, index, array) => {
    expect(cur).toEqual(expect.any(Number));
    expect(cur).toBeGreaterThanOrEqual(prev);
    if (index === array.length - 1) expect(cur).toBe(100);
    return cur;
  }, 0);
  expect(applyPaletteProgressMarks.length).toBeGreaterThan(0);
  applyPaletteProgressMarks.reduce((prev, cur, index, array) => {
    expect(cur).toEqual(expect.any(Number));
    expect(cur).toBeGreaterThanOrEqual(prev);
    if (index === array.length - 1) expect(cur).toBe(100);
    return cur;
  }, 0);
}, 60000);

