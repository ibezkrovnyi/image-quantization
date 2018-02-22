'use strict';

const fs  = require('fs'),
	  PNG = require('pngjs').PNG,
	  iq  = require('../../dist/iq');

const readPng = (file) => {
	const buffer = fs.readFileSync(file);
	return PNG.sync.read(buffer);
};

const files = {
	palette : readPng('./palette/palette.png'), // pngjs crashes if image contains less than 4 pixels
	image1  : readPng('./images/baby.png'),
	image2  : readPng('./images/children-602977_1920.png'),
	image3  : readPng('./images/quantfrog.png')
};

const getPalette = () => {
	const palette = new iq.utils.Palette();
	files.palette.palette.forEach(color => {
		palette.add(iq.utils.Point.createByQuadruplet(color))
	});
	return palette;
};

const applyPalette = (outFile, inPng, palette) => {
	// apply palette using IQ
	const distance          = new iq.distance.EuclideanBT709NoAlpha(),
		  inPointContainer  = iq.utils.PointContainer.fromUint8Array(inPng.data, inPng.width, inPng.height),
		  image             = new iq.image.ErrorDiffusionArray(distance, iq.image.ErrorDiffusionArrayKernel.SierraLite),
		  outPointContainer = image.quantize(inPointContainer, palette);

	// write PNG using pngjs
	inPng.data = outPointContainer.toUint8Array();
	fs.writeFileSync(outFile, PNG.sync.write(inPng))
};

const palette = getPalette();
try {
	fs.mkdirSync('./out');
} catch(e) {}
applyPalette('./out/baby.png', files.image1, palette);
applyPalette('./out/children-602977_1920.png', files.image2, palette);
applyPalette('./out/quantfrog.png', files.image3, palette);
