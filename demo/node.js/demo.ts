/// <reference path='../../src/iq.ts' />
var width = 16,
	height = 16,
	imageArray = [],
	distance = new IQ.Color.DistanceCIEDE2000();

for(var i = 0; i < width * height * 4; i++) {
	imageArray[i] = (Math.random() * 256) | 0;
}

function timeMark(title, callback) {
	var start = Date.now();
	callback();
	console.log(title + ": " + (Date.now() - start));
}

timeMark("!!! total time", () => {
for(var i = 0; i < 1; i++) {
	// simulate image loading
	var pointBuffer = IQ.Utils.PointContainer.fromArray(imageArray, width, height),
		iqPalette,
		iqImage,
		palette;

	// quantize palette
	timeMark("palette: neuquant", function() {
		iqPalette = new IQ.Palette.NeuQuant(distance, 256);
		iqPalette.sample(pointBuffer);
		palette = iqPalette.quantize();
	});

	timeMark("palette: rgbquant", function() {
		iqPalette = new IQ.Palette.RgbQuant(distance, 256);
		iqPalette.sample(pointBuffer);
		palette = iqPalette.quantize();
	});

	timeMark("palette: wuquant", function() {
		iqPalette = new IQ.Palette.WuQuant(distance, 256);
		iqPalette.sample(pointBuffer);
		palette = iqPalette.quantize();
	});

	// quantize image
	timeMark("image: error diffusion: sierra lite", function() {
		iqImage = new IQ.Image.DitherErrorDiffusion(distance, IQ.Image.DitherErrorDiffusionKernel.SierraLite);
		iqImage.quantize(pointBuffer, palette);
	});
}
});

/*
function method1(a, b, c, d) {
	return a * a + b*b + c*c + d*d;
}
function method2(a, b, c, d) {
	return Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2) + Math.pow(d, 2);
}
function doLoops(callback) {
	var sum = 0;
	for(var i = 0; i < 10000000; i++) {
		sum += callback(i, i+5, Math.random()|0, 17);
	}
} 
timeMark("method1", function() {
	doLoops(method1);
});

timeMark("method2", function() {
	doLoops(method2);
});

timeMark("method1", function() {
	doLoops(method1);
});

timeMark("method2", function() {
	doLoops(method2);
});

timeMark("method1", function() {
	doLoops(method1);
});

timeMark("method2", function() {
	doLoops(method2);
});
*/
