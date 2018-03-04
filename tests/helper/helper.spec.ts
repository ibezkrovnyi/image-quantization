import { buildPalette, applyPalette, utils, ColorDistanceFormula, PaletteQuantization, ImageQuantization } from '../../src/image-q';


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

test(`applyPalette`, async function () {
  let buildPaletteProgressMarks = [];
  const palette = await buildPalette(
    [pointContainer], 
    ColorDistanceFormula.Euclidean, 
    PaletteQuantization.WuQuant, 
    128, 
    progress => buildPaletteProgressMarks.push(progress),
  );
  expect(palette).toBeInstanceOf(utils.Palette);

  let applyPaletteProgressMarks = [];
  const outPointContainer = await applyPalette(
    pointContainer,
    palette,
    ColorDistanceFormula.Euclidean, 
    ImageQuantization.FloydSteinberg, 
    progress => applyPaletteProgressMarks.push(progress),
  );
  expect(outPointContainer).toBeInstanceOf(utils.PointContainer);

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

