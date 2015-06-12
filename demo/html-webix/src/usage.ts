module Usage {
	function typeOf(val) {
		return Object.prototype.toString.call(val).slice(8, -1);
	}

	function timeMark(title, callback) {
		var start = Date.now();
		callback();
		console.log(title + ": " + (Date.now() - start));
	}

	function baseName(src) {
		return src.split("/").pop().split(".");
	}

	export function drawPixels(pointContainer, width0, width1? : number) {
		var idxi8 = pointContainer.toUint8Array(),
			idxi32 = new Uint32Array(idxi8.buffer);

		width1 = width1 || width0;

		var can = document.createElement("canvas"),
			can2 = document.createElement("canvas"),
			ctx : any = can.getContext("2d"),
			ctx2 : any = can2.getContext("2d");

		can.width = width0;
		can.height = Math.ceil(idxi32.length / width0);
		can2.width = width1;
		can2.height = Math.ceil(can.height * width1 / width0);

		ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = false;
		ctx2.imageSmoothingEnabled = ctx2.mozImageSmoothingEnabled = ctx2.webkitImageSmoothingEnabled = ctx2.msImageSmoothingEnabled = false;

		var imgd = ctx.createImageData(can.width, can.height);

		if (typeOf(imgd.data) == "CanvasPixelArray") {
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

	function getColorDistanceCalculator(option) : IQ.Color.IDistanceCalculator {
		switch (option) {
			case 0:
				return new IQ.Color.DistanceEuclidean();
			case 1:
				return new IQ.Color.DistanceManhattan();
			case 2:
				return new IQ.Color.DistanceCIEDE2000();
			case 3:
				return new IQ.Color.DistanceCIE94();
			case 4:
				return new IQ.Color.DistanceEuclideanRgbQuantWOAlpha();
			case 5:
				return new IQ.Color.DistanceManhattanNeuQuant();
			case 6:
				return new IQ.Color.DistanceEuclideanWuQuant();
			case 7:
				return new IQ.Color.DistanceCMETRIC();
		}
	}

	export function quantize(img : HTMLImageElement, optionColors, optionPaletteQuantizer, optionImageDithering, optionColorDistance) : {palette : IQ.Utils.Palette, image : IQ.Utils.PointContainer, time : number, ssim : number, original : IQ.Utils.PointContainer} {
		var pointBuffer  : IQ.Utils.PointContainer,
			originalPointBuffer : IQ.Utils.PointContainer,
			paletteQuantizer : IQ.IPaletteQuantizer,
			id = baseName(img.src)[0],
			pal8 : IQ.Utils.Palette,
			img8 : IQ.Utils.PointContainer;

		pointBuffer = IQ.Utils.PointContainer.fromHTMLImageElement(img);
		originalPointBuffer = pointBuffer.clone();

		var time = Date.now();
		var distance : IQ.Color.IDistanceCalculator = getColorDistanceCalculator(optionColorDistance);

		console.log("image = " + id);
		timeMark("...sample", function () {
			//var distance = getColorDistanceCalculator(optionColorDistance);

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

		timeMark("...palette", function () {
			pal8 = paletteQuantizer.quantize();
		});

		timeMark("...dither", function () {
			//var distance = getColorDistanceCalculator(optionColorDistance);

			var imageQuantizer;
			if (optionImageDithering === -1) {
				imageQuantizer = new IQ.Image.NearestColor(distance);
			} else {
				imageQuantizer = new IQ.Image.DitherErrorDiffusion(distance, optionImageDithering);
			}

			img8 = imageQuantizer.quantize(pointBuffer, pal8);
		});

		time = Date.now() - time;
		var ssim = new IQ.Quality.SSIM().compare(originalPointBuffer, pointBuffer);
		return {
			original : originalPointBuffer,
			image : img8,
			palette : pal8,
			time : time,
			ssim : ssim
		};
	}
}
