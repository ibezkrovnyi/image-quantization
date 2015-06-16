/*
 * NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994. See
 * "Kohonen neural networks for optimal colour quantization" in "Network:
 * Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of
 * the algorithm.
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal in
 * this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons who
 * receive copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 */

/**
 * @preserve TypeScript port:
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * neuquant.ts - part of Image Quantization Library
 */

///<reference path="../common.ts"/>
///<reference path="../../distance/common.ts"/>
module IQ.Palette {
	"use strict";

	// bias for colour values
	var networkBiasShift = 8;
	
	class Neuron {
		public r; // TODO: Type: Double
		public g; // TODO: Type: Double
		public b; // TODO: Type: Double
		public a; // TODO: Type: Double

		constructor(defaultValue) {
			this.r = this.g = this.b = this.a = defaultValue;
		}

		public toPoint() : Utils.Point {
			/*
			 TODO: fix came from original NEUQUANT by Anthony Dekker (http://members.ozemail.com.au/~dekker/NEUQUANT.HTML)
			 TODO: can't find any difference, investigate
			 var temp = (neuron.r + (1 << (networkBiasShift - 1))) >> networkBiasShift;
			 if (temp > 255) temp = 255;
			 neuron.r = temp;
			 */
			return Utils.Point.createByRGBA(this.r >> networkBiasShift, this.g >> networkBiasShift, this.b >> networkBiasShift, this.a >> networkBiasShift);
		}

		public subtract(r : number, g : number, b : number, a : number) : void {
			this.r -= r;
			this.g -= g;
			this.b -= b;
			this.a -= a;
/*
			this.r -= r | 0;
			this.g -= g | 0;
			this.b -= b | 0;
			this.a -= a | 0;
*/
		}
	}

	export class NeuQuant implements IPaletteQuantizer {
		/*
		 four primes near 500 - assume no image has a length so large
		 that it is divisible by all four primes
		 */
		private static _prime1 : number = 499;
		private static _prime2 : number = 491;
		private static _prime3 : number = 487;
		private static _prime4 : number = 503;
		private static _minpicturebytes : number = NeuQuant._prime4;

		// no. of learning cycles
		private static _nCycles : number = 100;

		// defs for freq and bias
		private static _initialBiasShift : number = 16;

		// bias for fractions
		private static _initialBias : number = (1 << NeuQuant._initialBiasShift);
		private static _gammaShift : number = 10;

		// _gamma = 1024
		private static _gamma : number = (1 << NeuQuant._gammaShift); // TODO: Type: Double
		private static _betaShift : number = 10;
		private static _beta : number = (NeuQuant._initialBias >> NeuQuant._betaShift); // TODO: Type: Double

		// _beta = 1/1024
		private static _betaGamma : number = (NeuQuant._initialBias << (NeuQuant._gammaShift - NeuQuant._betaShift)); // TODO: Type: Double

		/*
		 * for 256 cols, radius starts
		 */
		private static _radiusBiasShift : number = 6;

		// at 32.0 biased by 6 bits
		private static _radiusBias : number = 1 << NeuQuant._radiusBiasShift;

		/*
		 * and
		 * decreases
		 * by a
		 */

		// factor of 1/30 each cycle
		private static _radiusDecrease : number = 30;

		/* defs for decreasing alpha factor */

		// alpha starts at 1.0
		private static _alphaBiasShift : number = 10;

		// biased by 10 bits
		private static _initAlpha : number = (1 << NeuQuant._alphaBiasShift); // TODO: Type: Double

		/* _radBias and _alphaRadBias used for radpower calculation */
		private static _radBiasShift : number = 8;
		private static _radBias : number = 1 << NeuQuant._radBiasShift;
		private static _alphaRadBiasShift : number = NeuQuant._alphaBiasShift + NeuQuant._radBiasShift;
		private static _alphaRadBias : number = 1 << NeuQuant._alphaRadBiasShift; // TODO: Type: Double

		private _pointArray : Utils.Point[];
		private _networkSize : number;
		private _network : Neuron[];

		/** sampling factor 1..30 */
		private _sampleFactor : number;
		private _radPower : number[]; // TODO: Type: Double

		// bias and freq arrays for learning
		private _freq : number[]; // TODO: Type: Double

		/* for network lookup - really 256 */
		private _bias : number[]; // TODO: Type: Double
		private _distance : Distance.IDistanceCalculator;

		constructor(colorDistanceCalculator : Distance.IDistanceCalculator, colors : number = 256) {
			this._distance = colorDistanceCalculator;
			this._pointArray = [];
			this._sampleFactor = 1;
			this._networkSize = colors;

			this._distance.setWhitePoint(255 << networkBiasShift, 255 << networkBiasShift, 255 << networkBiasShift, 255 << networkBiasShift);
		}

		public sample(pointBuffer : Utils.PointContainer) : void {
			this._pointArray = this._pointArray.concat(pointBuffer.getPointArray());
		}

		public quantize() : Utils.Palette {
			this._init();
			this._learn();
			this._inxbuild();

			return this._buildPalette();
		}

		private _init() : void {
			this._freq = [];
			this._bias = [];
			this._radPower = [];
			this._network = [];
			for (var i = 0; i < this._networkSize; i++) {
				this._network[i] = new Neuron((i << networkBiasShift + 8) / this._networkSize | 0);

				// 1/this._networkSize
				this._freq[i] = NeuQuant._initialBias / this._networkSize | 0;
				this._bias[i] = 0;
			}
		}

		/**
		 * Main Learning Loop
		 */
		private _learn() : void {
			var i, step;

			var pointsNumber = this._pointArray.length;
			if (pointsNumber < NeuQuant._minpicturebytes) this._sampleFactor = 1;

			var alphadec = 30 + (this._sampleFactor - 1) / 3, // TODO: Type: Double
				pointIndex = 0,
				pointsToSample = pointsNumber / this._sampleFactor | 0,
				delta = pointsToSample / NeuQuant._nCycles | 0,
				alpha = NeuQuant._initAlpha, // TODO: Type: Double
				radius = (this._networkSize >> 3) * NeuQuant._radiusBias; // TODO: Type: Double

			var rad = radius >> NeuQuant._radiusBiasShift;
			if (rad <= 1) rad = 0;

			for (i = 0; i < rad; i++) {
				this._radPower[i] = alpha * (((rad * rad - i * i) * NeuQuant._radBias) / (rad * rad)) >>> 0;
			}

			if (pointsNumber < NeuQuant._minpicturebytes) {
				step = 1;
			} else if (pointsNumber % NeuQuant._prime1 != 0) {
				step = NeuQuant._prime1;
			} else if ((pointsNumber % NeuQuant._prime2) != 0) {
				step = NeuQuant._prime2;
			} else if ((pointsNumber % NeuQuant._prime3) != 0) {
				step = NeuQuant._prime3;
			} else {
				step = NeuQuant._prime4;
			}

			i = 0;
			while (i < pointsToSample) {
				var point = this._pointArray[pointIndex],
					b = point.b << networkBiasShift,
					g = point.g << networkBiasShift,
					r = point.r << networkBiasShift,
					a = point.a << networkBiasShift,
					j = this._contest(b, g, r, a);

				this._alterSingle(alpha, j, b, g, r, a);

				if (rad != 0) this._alterNeighbour(rad, j, b, g, r, a);

				/* alter neighbours */
				pointIndex += step;
				if (pointIndex >= pointsNumber) pointIndex -= pointsNumber;
				i++;

				if (delta == 0) delta = 1;

				if (i % delta == 0) {
					alpha -= (alpha / alphadec) | 0;
					radius -= (radius / NeuQuant._radiusDecrease) | 0;
					rad = radius >> NeuQuant._radiusBiasShift;

					if (rad <= 1) rad = 0;
					for (j = 0; j < rad; j++) this._radPower[j] = alpha * (((rad * rad - j * j) * NeuQuant._radBias) / (rad * rad)) >>> 0;
				}
			}

		}

		/**
		 * Insertion sort of network and building of netindex[0..255] (to do after unbias)
		 */
		private _inxbuild() {
			this._network = this._network.sort((a : Neuron, b : Neuron) => {
				return a.g - b.g;
			});
		}

		private _buildPalette() : Utils.Palette {
			var palette = new Utils.Palette();

			this._network.forEach(neuron => {
				palette.add(neuron.toPoint());
			});

			palette.sort();
			return palette;
		}

		/**
		 * Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2)) in radpower[|i-j|]
		 */
		private _alterNeighbour(rad, i, b, g, r, al) : void {
			var j, k, lo, hi, m, p;

			lo = i - rad;
			if (lo < -1) lo = -1;

			hi = i + rad;

			if (hi > this._networkSize) hi = this._networkSize;

			j = i + 1;
			k = i - 1;
			m = 1;

			while ((j < hi) || (k > lo)) {

				var a = this._radPower[m++] / NeuQuant._alphaRadBias; // TODO: Type: Double
				if (j < hi) {
					p = this._network[j++];
					p.subtract(
						a * (p.r - r),
						a * (p.g - g),
						a * (p.b - b),
						a * (p.a - al)
					);
				}

				if (k > lo) {
					p = this._network[k--];
					p.subtract(
						a * (p.r - r),
						a * (p.g - g),
						a * (p.b - b),
						a * (p.a - al)
					);
				}
			}
		}

		/**
		 * Move neuron i towards biased (b,g,r) by factor alpha
		 */
		private _alterSingle(alpha, i, b, g, r, a) : void {
			/* alter hit neuron */
			var n = this._network[i];
			n.subtract(
				(alpha * (n.r - r)) / NeuQuant._initAlpha,
				(alpha * (n.g - g)) / NeuQuant._initAlpha,
				(alpha * (n.b - b)) / NeuQuant._initAlpha,
				(alpha * (n.a - a)) / NeuQuant._initAlpha
			);
		}

		/**
		 * Search for biased BGR values
		 * description:
		 *    finds closest neuron (min dist) and updates freq
		 *    finds best neuron (min dist-bias) and returns position
		 *    for frequently chosen neurons, freq[i] is high and bias[i] is negative
		 *    bias[i] = _gamma*((1/this._networkSize)-freq[i])
		 *
		 * Original distance equation:
		 *        dist = n.b - b;
		 *        if (dist < 0) dist = -dist;
		 *        a = n.g - g;
		 *        if (a < 0) a = -a;
		 *        dist += a;
		 *        a = n.r - r;
		 *        if (a < 0) a = -a;
		 *        dist += a;
		 *        a = (n.a - al);
		 *        if (a < 0) a = -a;
		 *        dist += a;
		 */
		private _contest(b, g, r, al) : number {
			var multiplier = (255 * 4) << networkBiasShift,
				bestd = ~(1 << 31), // TODO: Type: Double
				bestbiasd = bestd, // TODO: Type: Double
				bestpos = -1,
				bestbiaspos = bestpos;

			for (var i = 0; i < this._networkSize; i++) {
				var n = this._network[i];

				var dist = this._distance.calculateNormalized(<any>n, <any>{r : r, g : g, b : b, a : al}) * multiplier | 0; // TODO: Type: Double

				if (dist < bestd) {
					bestd = dist;
					bestpos = i;
				}

				var biasdist = dist - ((this._bias[i]) >> (NeuQuant._initialBiasShift - networkBiasShift));
				if (biasdist < bestbiasd) {
					bestbiasd = biasdist;
					bestbiaspos = i;
				}
				var betafreq = (this._freq[i] >> NeuQuant._betaShift); // TODO: Type: Double
				this._freq[i] -= betafreq;
				this._bias[i] += (betafreq << NeuQuant._gammaShift);
			}
			this._freq[bestpos] += NeuQuant._beta;
			this._bias[bestpos] -= NeuQuant._betaGamma;
			return (bestbiaspos);
		}
	}
}
