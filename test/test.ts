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
			64
		],
		image    : [
			IQ.Image.NearestColor,
			/*
			 IQ.Image.ErrorDiffusionArray,
			 IQ.Image.ErrorDiffusionRiemersma
			 */
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

	interface FileRecord {
		file : string;
		image : any;
		pointContainer : IQ.Utils.PointContainer;
	}

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

			quantized.writeImage(path.join(folder, file), function (err) {
				processed++;
				if (fileRecords.length === processed) {
					processLater(callback);

					imageQuantizer = paletteQuantizer = distance = fileRecord = null;
					quantized = containerCopy = pal = qBuf = null;
					callback = null;
				}
			});
		});
	}

	function readSourceFiles(sourceFolder : string, callback : (fileRecords) => void) {
		var files       = getFilesInFolder("PngSuite", true, file => file.indexOf(".png") === -1),
			fileRecords = [],
			processed   = 0;

		files.forEach(file => {
			PNGImage.readImage(path.join(sourceFolder, file), function (err, image) {
				if (err) {
					console.log("ERROR - " + err + ", " + file);
				} else {
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
					console.log(file + " read OK");
					fileRecords.push({
						folder         : sourceFolder,
						file           : file,
						image          : image,
						pointContainer : buf
					});
				}
				processed++;
				if (files.length === processed) {
					processLater(() => {
						callback(fileRecords);
					});
				}
			});
		});
	}

	function testConditionColors(fileRecords, colors : number, done : MochaDone) {
		var combinations = [];

		options.palette.forEach(paletteKlass => {
			options.image.forEach(imageKlass => {
				options.distance.forEach(distanceKlass => {
					fileRecords.forEach(fileRecord => {
						combinations.push({
							paletteKlass  : paletteKlass,
							imageKlass    : imageKlass,
							distanceKlass : distanceKlass,
							fileRecord    : fileRecord
						});
					});
				});
			});
		});

		var runNext = () => {
			console.log("left ", combinations.length, " tasks!");
			if (combinations.length > 0) {
				var item          = combinations.pop(),
					distanceKlass = item.distanceKlass,
					imageKlass    = item.imageKlass,
					paletteKlass  = item.paletteKlass,
					fileRecord = item.fileRecord;

				var distance = new distanceKlass(),
					palette  = new (<any>paletteKlass)(distance, colors),
					folder   = colors + "/" + (<any>imageKlass).name + "/" + (<any>paletteKlass).name + "/" + (<any>distanceKlass).name;

				/*
				 if (<any>imageKlass === IQ.Image.ErrorDiffusionArray) {
				 for (var i = 0; i <= 8; i++) {
				 var imageQuantizer = new (<any>imageKlass)(distance, i);
				 n++;
				 console.log("add");
				 testPalette(folder + "/" + IQ.Image.ErrorDiffusionArrayKernel[i], fileRecords, imageQuantizer, palette, distance, () => {
				 n--;
				 checkDone();
				 });
				 }
				 } else {
				 */
				var imageQuantizer = new (<any>imageKlass)(distance);
				testPalette(folder, [fileRecord], imageQuantizer, palette, distance, runNext);
				//}
			} else {
				done();
			}
		};

		runNext();
	}

	describe('image-quantization', () => {
		var fileRecords;

		before(done => {
			readSourceFiles("PngSuite", _fileRecords => {
				fileRecords = _fileRecords;
				done();
			});
		});

		describe('color tests', function () {
			options.colors.forEach(colors => {
				it(colors + ' colors', function (done : MochaDone) {
					this.timeout(50000);
					testConditionColors(fileRecords, colors, done);
				});
			});
		});
		/*
		 describe('image-quantization', function () {
		 it('2 colors', function (done : MochaDone) {
		 testConditionColors(fileRecords, 2, done);
		 });
		 });

		 describe('image-quantization', function () {
		 it('16 colors', function (done : MochaDone) {
		 testConditionColors(fileRecords, 16, done);
		 });
		 });

		 describe('image-quantization', function () {
		 this.timeout(5000);
		 it('64 colors', function (done : MochaDone) {
		 testConditionColors(fileRecords, 64, done);
		 });
		 });

		 describe('image-quantization', function () {
		 this.timeout(50000);
		 it('256 colors', function (done : MochaDone) {
		 testConditionColors(fileRecords, 256, done);
		 });
		 });
		 */
	});
}
