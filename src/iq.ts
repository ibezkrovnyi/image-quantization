/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */

/// <reference path='color/common.ts' />
/// <reference path='color/constants.ts' />
/// <reference path='color/conversion.ts' />
/// <reference path='color/distance.ts' />

/// <reference path='utils/point.ts' />
/// <reference path='utils/palette.ts' />
/// <reference path='utils/pointContainer.ts' />
/// <reference path='utils/hueStatistics.ts' />

/// <reference path='image/common.ts' />
/// <reference path='image/ditherErrorDiffusion.ts' />
/// <reference path='image/nearestColor.ts' />

/// <reference path="palette/common.ts"/>
/// <reference path="palette/neuquant/neuquant.ts"/>
/// <reference path="palette/rgbquant/rgbquant.ts"/>
/// <reference path="palette/wu/wuQuant.ts"/>

/// <reference path="quality/ssim.ts"/>

/// <reference path='utils/utils.ts' />

function test() {

	var distance = new IQ.Color.DistanceCIEDE2000();
	window["fastDelta"] = 0;

	var r           = 0,
		maxDistance = 0,
		minDistance = Number.MAX_VALUE;

	function doNextR() {
		console.log("red = " + r + "," + maxDistance + ", " + minDistance + "," + window["fastDelta"]);
		if (r > 255) {
			console.log("done " + maxDistance + ", " + minDistance + "," + window["fastDelta"]);
			return;
		}

		for (var g = 0; g <= 255; g++) {
			//console.log("green = " + g + "," + maxDistance + ", " + minDistance + "," + window["fastDelta"]);
			for (var b = 0; b <= 255; b++) {
				//console.log("blue = " + b + "," + maxDistance + ", " + minDistance + "," + window["fastDelta"]);
				for (var dR = -1; dR <= 1; dR++) {
					for (var dG = -1; dG <= 1; dG++) {
						for (var dB = -1; dB <= 1; dB++) {
							var r2 = IQ.Utils.intInRange(r + dR, 0, 255),
								g2 = IQ.Utils.intInRange(g + dG, 0, 255),
								b2 = IQ.Utils.intInRange(b + dB, 0, 255);

							if (r2 === r && g2 === g && b2 === b) continue;

							var d = distance.calculateRaw(r << 4, g << 4, b << 4, 0, r2 << 4, g2 << 4, b2 << 4, 0);
							if (d > maxDistance) maxDistance = d;
							if (d < minDistance) minDistance = d;
						}
					}
				}
			}
		}
		r++;
		setTimeout(doNextR, 50);
	}

	doNextR();
}
