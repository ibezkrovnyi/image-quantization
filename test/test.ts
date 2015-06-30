/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/mocha/mocha-node.d.ts" />
/// <reference path="typings/chai/chai.d.ts" />
/// <reference path="../src/iq.ts" />

declare var PNGImage : any;

var chai : typeof chai = require('chai'),
	path               = require("path"),
	fs                 = require("fs");

var PNGImage = require('pngjs-image');

var expect = chai.expect;

module Test {
	var options = {
		colors   : [
			2,
			/*
			 16,
			 64,
			 256,
			 2048
			 */
		],
		image    : [
			IQ.Image.NearestColor,
			//IQ.Image.ErrorDiffusionArray,
			/*			IQ.Image.ErrorDiffusionRiemersma
			 */
		],
		palette  : [
			IQ.Palette.NeuQuant,
			/*
			 IQ.Palette.NeuQuantFloat,
			 IQ.Palette.RgbQuant,
			 IQ.Palette.WuQuant
			 */
		],
		distance : [
			IQ.Distance.Euclidean,
			/*
			 IQ.Distance.EuclideanRgbQuantWithAlpha,
			 IQ.Distance.EuclideanRgbQuantWOAlpha,
			 IQ.Distance.CIE94,
			 IQ.Distance.CIEDE2000,
			 IQ.Distance.CIEDE2000_Original,
			 IQ.Distance.CMETRIC,
			 IQ.Distance.Manhattan,
			 IQ.Distance.ManhattanSRGB
			 */
		]
	};

	function createDirectory(dir : string) {
		var folders = path.normalize(dir).replace(/\\/g, "/").split("/");

		if (folders && folders.length > 0) {
			for (var i = 0; i < folders.length; i++) {
				var testDir = folders.slice(0, i + 1).join("/");
				if (!fs.existsSync(testDir)) {
					fs.mkdirSync(testDir);
				}
			}
		}
	}

	function getFilesInFolder(folder : string, recursive : boolean = true, filter : (file : string) => boolean = null, subFolder : string = null) : string[] {
		var fullFolder  = subFolder === null ? folder : path.join(folder, subFolder),
			folderFiles = fs.readdirSync(fullFolder),
			files       = [];

		folderFiles.forEach(function (file) {
			if (filter && filter(file)) {
				console.log(path.join(fullFolder, file) + " removed by filter");
				return;
			}

			var stat              = fs.statSync(path.join(fullFolder, file)),
				subFolderFileName = subFolder === null ? file : path.join(subFolder, file);

			if (stat.isFile()) {
				files.push(subFolderFileName);
			} else if (stat.isDirectory()) {
				if (recursive) {
					files = files.concat(getFilesInFolder(folder, recursive, filter, subFolderFileName));
				}
			}
		});

		return files.map(function (file) {
			return file.replace(/\\/g, "/");
		});
	}

	function processLater(fn : () => any) {
		setTimeout(fn, 1);
	}

	function testPalette(folder : string, imageQuantizer : IQ.Image.IImageDitherer, paletteQuantizer : IQ.Palette.IPaletteQuantizer, distance : IQ.Distance.IDistanceCalculator, callback : () => void) : void {
		folder = path.join("generated", folder);
		createDirectory(folder);

		var files = getFilesInFolder("PngSuite", true, file => file.indexOf(".png") === -1);

		files.forEach(file => {
			PNGImage.readImage(path.join("PngSuite", file), function (err, image) {
				if (err) {
					console.log("ERROR - " + err + ", " + file);
					processLater(callback);
					return;
				}
				console.log("OK - " + file);

				var w   = image.getWidth(),
					h   = image.getHeight(),
					buf = new IQ.Utils.PointContainer(w, h);

				for (var x = 0; x < w; x++) {
					for (var y = 0; y < h; y++) {
						var idx = image.getIndex(x, y);
						buf.setAt(IQ.Utils.Point.createByRGBA(
							image.getRed(idx),
							image.getGreen(idx),
							image.getBlue(idx),
							image.getAlpha(idx)
						), x, y);
					}
				}

				//var buf = IQ.Utils.PointContainer.fromNodeBuffer(image.getBlob(), image.getWidth(), image.getHeight());
				paletteQuantizer.sample(buf);
				var pal    = paletteQuantizer.quantize();
				var qBuf   = imageQuantizer.quantize(buf, pal);

				//var quantized = PNGImage.createImage(w, h);
				for (var x = 0; x < w; x++) {
					for (var y = 0; y < h; y++) {
						var color = qBuf.getAt(x, y);
						image.setAt(x, y, {
							red   : color.r,
							green : color.g,
							blue  : color.b,
							alpha : color.a
						});
					}
				}
				// Get width and height
				//console.log(image.getWidth());
				//console.log(image.getHeight());

				// Set a pixel at (20, 30) with red, having an alpha value of 100 (half-transparent)
				//image.setAt(20, 30, { red:255, green:0, blue:0, alpha:100 });

				//console.log(file,w , h);
				image.writeImage(path.join(folder, file), function (err) {
					console.log(file);
					processLater(callback);
				});
			});
		});
	}

	describe('image-quantization', function () {
		it('xx', function (done : MochaDone) {

			var n = 0;
			function checkDone() {
				if(n === -500) {
					done();
				}
			}

			options.colors.forEach(colors => {

				options.palette.forEach(paletteKlass => {
					options.image.forEach(imageKlass => {
						options.distance.forEach(distanceKlass => {

							var distance = new distanceKlass(),
								palette  = new (<any>paletteKlass)(distance, colors),
								folder   = colors + "/" + (<any>imageKlass).name + "/" + (<any>paletteKlass).name + "/" + (<any>distanceKlass).name;

							if (<any>imageKlass === IQ.Image.ErrorDiffusionArray) {
								for (var i = 0; i <= 8; i++) {
									var imageQuantizer = new (<any>imageKlass)(distance, i);
									n++;
									testPalette(folder + "/" + IQ.Image.ErrorDiffusionArrayKernel[ i ], imageQuantizer, palette, distance, () => {
										n--;
										checkDone();
									});
								}
							} else {
								var imageQuantizer = new (<any>imageKlass)(distance);
								n++;
								testPalette(folder, imageQuantizer, palette, distance, () => {
									n--;
									checkDone();
								});
							}
						});
					});
				});
			});
		});

		/*testPalette('neuquant (integer)', IQ.Palette.NeuQuant);
		 testPalette('rgbquant (integer)', IQ.Palette.RgbQuant);
		 testPalette('neuquant (float)', IQ.Palette.NeuQuantFloat);
		 testPalette('wuquant (integer)', IQ.Palette.WuQuant);*/
		/*
		 it('should return -1 when the value is not present', function() {
		 expect(this.chunks).to.contain.keys('IDAT', 'IHDR', 'IEND');
		 })
		 */
	});
}
