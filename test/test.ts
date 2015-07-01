/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../src/iq.ts" />
/// <reference path="typings/mocha/mocha.d.ts"/>
/// <reference path="utils.ts"/>

module Test {

	var PNGImage : any     = require('pngjs-image'),
		chai : typeof chai = require('chai'),
		path               = require("path"),
		fs                 = require("fs"),
		expect             = chai.expect;

	var options = {
		colors   : [
			2,
			8,
			16,
			64,
			256,
			2048
		],
		image    : [
			IQ.Image.NearestColor,
			IQ.Image.ErrorDiffusionArray,
			IQ.Image.ErrorDiffusionRiemersma
		],
		palette  : [
			IQ.Palette.NeuQuant,
			IQ.Palette.NeuQuantFloat,
			IQ.Palette.RgbQuant,
			IQ.Palette.WuQuant
		],
		distance : [
			IQ.Distance.Euclidean,
			IQ.Distance.EuclideanRgbQuantWithAlpha,
			IQ.Distance.EuclideanRgbQuantWOAlpha,
			IQ.Distance.CIE94,
			IQ.Distance.CIEDE2000,
			IQ.Distance.CIEDE2000_Original,
			IQ.Distance.CMETRIC,
			IQ.Distance.Manhattan,
			IQ.Distance.ManhattanSRGB
		]
	};

	function testPalette(folder : string, fileRecords : FileRecord[], imageQuantizer : IQ.Image.IImageDitherer, paletteQuantizer : IQ.Palette.IPaletteQuantizer, distance : IQ.Distance.IDistanceCalculator, callback : () => void) : void {
		folder = path.join("generated", folder);
		createDirectory(folder);

		var processed = 0;
		fileRecords.forEach(fileRecord => {
			var file  = fileRecord.file,
				image = fileRecord.image,
				w     = image.getWidth(),
				h     = image.getHeight();

			//var buf = IQ.Utils.PointContainer.fromNodeBuffer(image.getBlob(), image.getWidth(), image.getHeight());
			var containerCopy = fileRecord.pointContainer.clone();
			paletteQuantizer.sample(containerCopy);
			var pal = paletteQuantizer.quantize();
			var qBuf = imageQuantizer.quantize(containerCopy, pal);

			var quantized = PNGImage.createImage(w, h);
			for (var x = 0; x < w; x++) {
				for (var y = 0; y < h; y++) {
					var color = qBuf.getAt(x, y);
					quantized.setAt(x, y, {
						red   : color.r,
						green : color.g,
						blue  : color.b,
						alpha : color.a
					});
				}
			}

			var targetFolderAndFile = path.join(folder, file);
			if(fs.existsSync(targetFolderAndFile)) {
				PNGImage.readImage(targetFolderAndFile, function (err, image) {
					if (err) {
						console.log("ERROR - " + err + ", " + targetFolderAndFile);
					} else {
						var w   = image.getWidth(),
							h   = image.getHeight(),
							isOk = true;

						if(w !== quantized.getWidth() || h !== quantized.getHeight()) {
							console.log("!!! Failed: width or height are different (" + targetFolderAndFile + ")");
							isOk = false;
						}

						for (var x = 0; x < w && isOk; x++) {
							for (var y = 0; y < h && isOk; y++) {
								var idx = image.getIndex(x, y);

								if(image.getAtIndex(idx) !== quantized.getAtIndex(idx)) {
									console.log("!!! Failed: images are different (" + targetFolderAndFile + ")");
									isOk = false;
								}
							}
						}
					}
					processed++;
					if (fileRecords.length === processed) {
						processLater(callback);

						imageQuantizer = paletteQuantizer = distance = fileRecord = null;
						quantized = containerCopy = pal = qBuf = null;
						callback = null;
					}
				});
			} else {
				quantized.writeImage(targetFolderAndFile, function (err) {
					processed++;
					if (fileRecords.length === processed) {
						processLater(callback);

						imageQuantizer = paletteQuantizer = distance = fileRecord = null;
						quantized = containerCopy = pal = qBuf = null;
						callback = null;
					}
				});
			}
		});
	}

	function testConditionColors(fileRecords, done : (err?) => void) {
		var combinations = [];

		options.colors.forEach(colors => {
			options.palette.forEach(paletteKlass => {
				options.image.forEach(imageKlass => {
					options.distance.forEach(distanceKlass => {
						fileRecords.forEach(fileRecord => {
							if (<any>imageKlass === IQ.Image.ErrorDiffusionArray) {
								for (var i = 0; i <= 8; i++) {
									combinations.push({
										colors               : colors,
										paletteKlass         : paletteKlass,
										imageKlass           : imageKlass,
										distanceKlass        : distanceKlass,
										fileRecord           : fileRecord,
										errorDiffusionKernel : i
									});
								}
							} else {
								combinations.push({
									colors               : colors,
									paletteKlass         : paletteKlass,
									imageKlass           : imageKlass,
									distanceKlass        : distanceKlass,
									fileRecord           : fileRecord,
									errorDiffusionKernel : -1
								});
							}
						});
					});
				});
			});
		});

		var runNext = () => {
			if (combinations.length > 0) {
				var item          = combinations.pop(),
					distanceKlass = item.distanceKlass,
					imageKlass    = item.imageKlass,
					paletteKlass  = item.paletteKlass,
					fileRecord    = item.fileRecord,
					colors        = item.colors;

				var distance = new distanceKlass(),
					palette  = new (<any>paletteKlass)(distance, colors),
					folder   = colors + "/" + (<any>imageKlass).name + "/" + (<any>paletteKlass).name + "/" + (<any>distanceKlass).name;

				console.log(path.join(folder, fileRecord.file) + " (" + combinations.length + " tasks left)");
				var imageQuantizer;
				if (item.errorDiffusionKernel >= 0) {
					imageQuantizer = new (<any>imageKlass)(distance, item.errorDiffusionKernel);
				} else {
					imageQuantizer = new (<any>imageKlass)(distance);
				}
				testPalette(folder, [fileRecord], imageQuantizer, palette, distance, runNext);
			} else {
				done();
			}
		};

		runNext();
	}

	readSourceFiles("images", fileRecords => {
		testConditionColors(fileRecords, err => {
			if (err) {
				console.log(err);
			} else {
				console.log("done");
			}
		});
	});
}
