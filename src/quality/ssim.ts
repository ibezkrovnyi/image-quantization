/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * ssim.ts - part of Image Quantization Library
 */
import {PointContainer} from "../utils/pointContainer"
import {Y} from "../constants/bt709"

// based on https://github.com/rhys-e/structural-similarity
// http://en.wikipedia.org/wiki/Structural_similarity
var K1 = 0.01,
	K2 = 0.03;

export class SSIM {
	compare(image1 : PointContainer, image2 : PointContainer) {
		if (image1.getHeight() !== image2.getHeight() || image1.getWidth() !== image2.getWidth()) {
			throw new Error("Images have different sizes!");
		}

		var bitsPerComponent = 8,
			L                = (1 << bitsPerComponent) - 1,
			c1               = Math.pow((K1 * L), 2),
			c2               = Math.pow((K2 * L), 2),
			numWindows       = 0,
			mssim            = 0.0;

		//calculate ssim for each window
		this._iterate(image1, image2, (lumaValues1 : number[], lumaValues2 : number[], averageLumaValue1 : number, averageLumaValue2 : number) => {
			//calculate variance and covariance
			var sigxy  = 0.0,
				sigsqx = 0.0,
				sigsqy = 0.0;

			for (var i = 0; i < lumaValues1.length; i++) {
				sigsqx += Math.pow((lumaValues1[ i ] - averageLumaValue1), 2);
				sigsqy += Math.pow((lumaValues2[ i ] - averageLumaValue2), 2);

				sigxy += (lumaValues1[ i ] - averageLumaValue1) * (lumaValues2[ i ] - averageLumaValue2);
			}

			var numPixelsInWin = lumaValues1.length - 1;
			sigsqx /= numPixelsInWin;
			sigsqy /= numPixelsInWin;
			sigxy /= numPixelsInWin;

			//perform ssim calculation on window
			var numerator   = (2 * averageLumaValue1 * averageLumaValue2 + c1) * (2 * sigxy + c2),
				denominator = (Math.pow(averageLumaValue1, 2) + Math.pow(averageLumaValue2, 2) + c1) * (sigsqx + sigsqy + c2),
				ssim        = numerator / denominator;

			mssim += ssim;
			numWindows++;

		});
		return mssim / numWindows;
	}

	private _iterate(image1 : PointContainer, image2 : PointContainer, callback : (lumaValues1 : number[], lumaValues2 : number[], averageLumaValue1 : number, averageLumaValue2 : number) => void) {
		var windowSize = 8,
			width      = image1.getWidth(),
			height     = image1.getHeight();

		for (var y = 0; y < height; y += windowSize) {
			for (var x = 0; x < width; x += windowSize) {
				// avoid out-of-width/height
				var windowWidth  = Math.min(windowSize, width - x),
					windowHeight = Math.min(windowSize, height - y);

				var lumaValues1  = this._calculateLumaValuesForWindow(image1, x, y, windowWidth, windowHeight),
					lumaValues2  = this._calculateLumaValuesForWindow(image2, x, y, windowWidth, windowHeight),
					averageLuma1 = this._calculateAverageLuma(lumaValues1),
					averageLuma2 = this._calculateAverageLuma(lumaValues2);

				callback(lumaValues1, lumaValues2, averageLuma1, averageLuma2);
			}
		}
	}

	private _calculateLumaValuesForWindow(image : PointContainer, x : number, y : number, width : number, height : number) : number[] {
		var pointArray            = image.getPointArray(),
			lumaValues : number[] = [],
			counter               = 0;

		for (var j = y; j < y + height; j++) {
			var offset = j * image.getWidth();
			for (var i = x; i < x + width; i++) {
				var point             = pointArray[ offset + i ];
				lumaValues[ counter ] = point.r * Y.RED + point.g * Y.GREEN + point.b * Y.BLUE;
				counter++;
			}
		}

		return lumaValues;
	}

	private _calculateAverageLuma(lumaValues : number[]) : number {
		var sumLuma = 0.0;
		for (var i = 0; i < lumaValues.length; i++) {
			sumLuma += lumaValues[ i ];
		}

		return sumLuma / lumaValues.length;
	}

}

