'use strict';
const fs = require('fs');
const iq = require('../../dist/cjs/image-q');
const PNG = require('pngjs').PNG;

const files = {
	palette: readPNG('./palette/palette.png'), // pngjs crashes if image contains less than 4 pixels
	image1: readPNG('./images/baby.png'),
	image2: readPNG('./images/children-602977_1920.png'),
	image3: readPNG('./images/quantfrog.png')
};

const palette = getPalette();
try {
	fs.mkdirSync('./out');
} catch (e) { }
applyPaletteAndWritePNG('./out/baby.png', files.image1, palette);
applyPaletteAndWritePNG('./out/children-602977_1920.png', files.image2, palette);
applyPaletteAndWritePNG('./out/quantfrog.png', files.image3, palette);

function readPNG(file) {
	const buffer = fs.readFileSync(file);
	return PNG.sync.read(buffer);
}

function getPalette() {
	const palette = new iq.utils.Palette();
	files.palette.palette.forEach(color => {
		palette.add(iq.utils.Point.createByQuadruplet(color))
	});
	return palette;
}

function applyPaletteAndWritePNG(outFile, inPng, palette) {
	// apply palette using IQ
	const distance = new iq.distance.EuclideanBT709NoAlpha();
	const inPointContainer = iq.utils.PointContainer.fromUint8Array(inPng.data, inPng.width, inPng.height);
	const image = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite);
	const outPointContainer = image.quantizeSync(inPointContainer, palette);

	// write PNG using pngjs
	inPng.data = outPointContainer.toUint8Array();
	fs.writeFileSync(outFile, PNG.sync.write(inPng));
}
