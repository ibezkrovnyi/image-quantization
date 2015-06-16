module Usage {

	export class QuantizationUsage {
		static drawPixels(pointContainer, width0, width1? : number) {
			var idxi8  = pointContainer.toUint8Array(),
				idxi32 = new Uint32Array(idxi8.buffer);

			width1 = width1 || width0;

			var can        = document.createElement("canvas"),
				can2       = document.createElement("canvas"),
				ctx : any  = can.getContext("2d"),
				ctx2 : any = can2.getContext("2d");

			can.width = width0;
			can.height = Math.ceil(idxi32.length / width0);
			can2.width = width1;
			can2.height = Math.ceil(can.height * width1 / width0);

			ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
			ctx2.imageSmoothingEnabled = ctx2.mozImageSmoothingEnabled = ctx2.webkitImageSmoothingEnabled = ctx2.msImageSmoothingEnabled = false;

			var imgd = ctx.createImageData(can.width, can.height);

			if (QuantizationUsage._typeOf(imgd.data) == "CanvasPixelArray") {
				var data = imgd.data;
				for (var i = 0, len = data.length; i < len; ++i) {
					data[i] = idxi8[i];
				}
			}
			else {
				var buf32 = new Uint32Array(imgd.data.buffer);
				buf32.set(idxi32);
			}

			ctx.putImageData(imgd, 0, 0);

			ctx2.drawImage(can, 0, 0, can2.width, can2.height);

			return can2;
		}

		private static _typeOf(val) {
			return Object.prototype.toString.call(val).slice(8, -1);
		}

		private _timeMark(title, callback) {
			var start = Date.now();
			callback();
			console.log(title + ": " + (Date.now() - start));
		}

		private _baseName(src) {
			return src.split("/").pop().split(".");
		}

		public quantize(img : HTMLImageElement, optionColors, optionPaletteQuantizer, optionImageDithering, optionColorDistance) : {palette : IQ.Utils.Palette, image : IQ.Utils.PointContainer, time : number, ssim : number, original : IQ.Utils.PointContainer} {
			var pointBuffer : IQ.Utils.PointContainer,
				originalPointBuffer : IQ.Utils.PointContainer,
				paletteQuantizer : IQ.IPaletteQuantizer,
				id = this._baseName(img.src)[0],
				palette : IQ.Utils.Palette,
				image : IQ.Utils.PointContainer;

			pointBuffer = IQ.Utils.PointContainer.fromHTMLImageElement(img);
			originalPointBuffer = pointBuffer.clone();

			var time = Date.now();

			console.log("image = " + id);
			this._timeMark("...sample", () => {
				var distance : IQ.Color.IDistanceCalculator = this._getColorDistanceCalculator(optionColorDistance);

				switch (optionPaletteQuantizer) {
					case 1:
						paletteQuantizer = new IQ.Palette.NeuQuant(distance, optionColors);
						break;
					case 3:
						paletteQuantizer = new IQ.Palette.WuQuant(distance, optionColors);
						break;
					case 2:
						paletteQuantizer = new IQ.Palette.RgbQuant(distance, optionColors);
						break;
				}
				paletteQuantizer.sample(pointBuffer);
			});

			this._timeMark("...palette", function () {
				palette = paletteQuantizer.quantize();
			});

			this._timeMark("...dither", ()  => {
				var distance : IQ.Color.IDistanceCalculator = this._getColorDistanceCalculator(optionColorDistance);

				var imageQuantizer;
				if (optionImageDithering === -1) {
					imageQuantizer = new IQ.Image.NearestColor(distance);
				} else {
					imageQuantizer = new IQ.Image.DitherErrorDiffusion(distance, optionImageDithering, true, 0, false);
				}

				image = imageQuantizer.quantize(pointBuffer, palette);
			});

			time = Date.now() - time;
			var ssim = new IQ.Quality.SSIM().compare(originalPointBuffer, pointBuffer);

			this._checkImageAndPalette(image, palette, optionColors);

			return {
				original : originalPointBuffer,
				image    : image,
				palette  : palette,
				time     : time,
				ssim     : ssim
			};
		}

		private _getColorDistanceCalculator(option) : IQ.Color.IDistanceCalculator {
			switch (option) {
				case 1:
					return new IQ.Color.DistanceEuclidean();
				case 2:
					return new IQ.Color.DistanceManhattan();
				case 3:
					return new IQ.Color.DistanceCIEDE2000();
				case 4:
					return new IQ.Color.DistanceCIE94();
				case 5:
					return new IQ.Color.DistanceEuclideanRgbQuantWOAlpha();
				case 6:
					return new IQ.Color.DistanceManhattanNeuQuant();
				case 7:
					return new IQ.Color.DistanceEuclideanWuQuant();
				case 8:
					return new IQ.Color.DistanceCMETRIC();
				case 9:
					return new IQ.Color.DistancePNGQUANT();
			}
		}

		private _checkImageAndPalette(image : IQ.Utils.PointContainer, palette : IQ.Utils.Palette, colors : number) : void {
			// check palette
			if(palette.getPointContainer().getPointArray().length > colors) {
				throw new Error("Palette contains more colors than allowed");
			}

			// check image
			image.getPointArray().forEach((point : IQ.Utils.Point) => {
				if(!palette.has(point)) {
					throw new Error("Image contains color not in palette: " + point.r + "," + point.g + "," + point.b + "," + point.a);
				}
			});
		}
	}

}
