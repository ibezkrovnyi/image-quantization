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
///<reference path="../../color/common.ts"/>
module IQ.Palette {
	"use strict";
	class Neuron {
		public r; // TODO: Type: Double
		public g; // TODO: Type: Double
		public b; // TODO: Type: Double
		public a; // TODO: Type: Double

		constructor(defaultValue) {
			this.r = this.g = this.b = this.a = defaultValue;
		}

		public toPoint() : Utils.Point {
			return Utils.Point.createByRGBA(this.r | 0, this.g | 0, this.b | 0, this.a | 0);
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

		// bias for colour values
		private static _netbiasshift : number = 4;

		// no. of learning cycles
		private static _ncycles : number = 100;

		// defs for freq and bias
		private static _intbiasshift : number = 16;

		// bias for fractions
		private static _intbias : number = (1 << NeuQuant._intbiasshift);
		private static _gammashift : number = 10;

		// _gamma = 1024
		private static _gamma : number = (1 << NeuQuant._gammashift); // TODO: Type: Double
		private static _betashift : number = 10;
		private static _beta : number = (NeuQuant._intbias >> NeuQuant._betashift); // TODO: Type: Double

		// _beta = 1/1024
		private static _betagamma : number = (NeuQuant._intbias << (NeuQuant._gammashift - NeuQuant._betashift)); // TODO: Type: Double

		/*
		 * for 256 cols, radius starts
		 */
		private static _radiusbiasshift : number = 6;

		// at 32.0 biased by 6 bits
		private static _radiusbias : number = 1 << NeuQuant._radiusbiasshift;

		/*
		 * and
		 * decreases
		 * by a
		 */

		// factor of 1/30 each cycle
		private static _radiusdec : number = 30;

		/* defs for decreasing alpha factor */

		// alpha starts at 1.0
		private static _alphabiasshift : number = 10;

		// biased by 10 bits
		private static _initalpha : number = (1 << NeuQuant._alphabiasshift); // TODO: Type: Double

		/* _radbias and _alpharadbias used for radpower calculation */
		private static _radbiasshift : number = 8;
		private static _radbias : number = 1 << NeuQuant._radbiasshift;
		private static _alpharadbshift : number = NeuQuant._alphabiasshift + NeuQuant._radbiasshift;
		private static _alpharadbias : number = 1 << NeuQuant._alpharadbshift; // TODO: Type: Double

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
		private _distance : Color.IDistanceCalculator;

		constructor(colorDistanceCalculator : Color.IDistanceCalculator, colors : number = 256) {
			this._distance = colorDistanceCalculator;
			this._pointArray = [];
			this._sampleFactor = 1;
			this._networkSize = colors;

			this._distance.setMaximalColorDeltas(255 << NeuQuant._netbiasshift, 255 << NeuQuant._netbiasshift, 255 << NeuQuant._netbiasshift, 255 << NeuQuant._netbiasshift);
		}

		public sample(pointBuffer : Utils.PointContainer) : void {
			this._pointArray = this._pointArray.concat(pointBuffer.getPointArray());
		}

		public quantize() : Utils.Palette {
			this._init();
			this._learn();
			this._unbiasnet();
			this._inxbuild();

			return this._buildPalette();
		}

		private _init() : void {
			this._freq = [];
			this._bias = [];
			this._radPower = [];
			this._network = [];
			for (var i = 0; i < this._networkSize; i++) {
				this._network[i] = new Neuron((i << (NeuQuant._netbiasshift + 8)) / this._networkSize);

				// 1/this._networkSize
				this._freq[i] = NeuQuant._intbias / this._networkSize;
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

			var alphadec = 30 + ((this._sampleFactor - 1) / 3), // TODO: Type: Double
				pointIndex = 0,
				pointsToSample = pointsNumber / this._sampleFactor | 0,
				delta = (pointsToSample / NeuQuant._ncycles) | 0,
				alpha = NeuQuant._initalpha, // TODO: Type: Double
				radius = (this._networkSize >> 3) * NeuQuant._radiusbias; // TODO: Type: Double

			var rad = radius >> NeuQuant._radiusbiasshift;
			if (rad <= 1) rad = 0;

			for (i = 0; i < rad; i++) {
				this._radPower[i] = alpha * (((rad * rad - i * i) * NeuQuant._radbias) / (rad * rad));
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
					b = point.b << NeuQuant._netbiasshift,
					g = point.g << NeuQuant._netbiasshift,
					r = point.r << NeuQuant._netbiasshift,
					a = point.a << NeuQuant._netbiasshift,
					j = this._contest(b, g, r, a);

				this._alterSingle(alpha, j, b, g, r, a);

				if (rad != 0) this._alterNeighbour(rad, j, b, g, r, a);

				/* alter neighbours */
				pointIndex += step;
				if (pointIndex >= pointsNumber) pointIndex -= pointsNumber;
				i++;

				if (delta == 0) delta = 1;

				if (i % delta == 0) {
					alpha -= alpha / alphadec;
					radius -= radius / NeuQuant._radiusdec;
					rad = radius >> NeuQuant._radiusbiasshift;

					if (rad <= 1) rad = 0;
					for (j = 0; j < rad; j++) this._radPower[j] = alpha * (((rad * rad - j * j) * NeuQuant._radbias) / (rad * rad));
				}
			}

		}

		/**
		 * Insertion sort of network and building of netindex[0..255] (to do after unbias)
		 */
		private _inxbuild() {
			var i, j, smallpos, smallval, p, q;
			for (i = 0; i < this._networkSize; i++) {
				p = this._network[i];
				smallpos = i;
				smallval = p.g;

				/* find smallest in i..this._networkSize-1 */
				for (j = i + 1; j < this._networkSize; j++) {
					q = this._network[j];
					if (q.g < smallval) {
						smallpos = j;
						smallval = q.g;
					}
				}

				q = this._network[smallpos];
				if (i != smallpos) {
					this._network[i] = q;
					this._network[smallpos] = p;
				}
			}
		}

		private _buildPalette() : Utils.Palette {
			var palette = new Utils.Palette();
			for (var j = 0; j < this._networkSize; j++) {
				palette.add(this._network[j].toPoint());
			}
			palette.sort();
			return palette;
		}

		/**
		 * Unbias network to give byte values 0..255 and record position i to prepare for sort
		 */
		private _unbiasnet() : void {
			for (var i = 0; i < this._networkSize; i++) {
				var neuron = this._network[i];
				neuron.b >>= NeuQuant._netbiasshift;
				neuron.g >>= NeuQuant._netbiasshift;
				neuron.r >>= NeuQuant._netbiasshift;
				neuron.a >>= NeuQuant._netbiasshift;
			}
		}

		/**
		 * Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2)) in radpower[|i-j|]
		 */
		private _alterNeighbour(rad, i, b, g, r, al) : void {
			var j, k, lo, hi, m, p;
			var a; // TODO: Type: Double

			lo = i - rad;
			if (lo < -1) lo = -1;

			hi = i + rad;

			if (hi > this._networkSize) hi = this._networkSize;

			j = i + 1;
			k = i - 1;
			m = 1;

			while ((j < hi) || (k > lo)) {

				a = this._radPower[m++];
				if (j < hi) {
					p = this._network[j++];
					p.b -= (a * (p.b - b)) / NeuQuant._alpharadbias;
					p.g -= (a * (p.g - g)) / NeuQuant._alpharadbias;
					p.r -= (a * (p.r - r)) / NeuQuant._alpharadbias;
					p.a -= (a * (p.a - al)) / NeuQuant._alpharadbias;
				}

				if (k > lo) {
					p = this._network[k--];
					p.b -= (a * (p.b - b)) / NeuQuant._alpharadbias;
					p.g -= (a * (p.g - g)) / NeuQuant._alpharadbias;
					p.r -= (a * (p.r - r)) / NeuQuant._alpharadbias;
					p.a -= (a * (p.a - al)) / NeuQuant._alpharadbias;
				}
			}
		}

		/**
		 * Move neuron i towards biased (b,g,r) by factor alpha
		 */
		private _alterSingle(alpha, i, b, g, r, a) : void {
			/* alter hit neuron */
			var n = this._network[i];
			n.b -= (alpha * (n.b - b)) / NeuQuant._initalpha;
			n.g -= (alpha * (n.g - g)) / NeuQuant._initalpha;
			n.r -= (alpha * (n.r - r)) / NeuQuant._initalpha;
			n.a -= (alpha * (n.a - a)) / NeuQuant._initalpha;
		}

		/**
		 * Search for biased BGR values
		 * description:
		 *    finds closest neuron (min dist) and updates freq
		 *    finds best neuron (min dist-bias) and returns position
		 *    for frequently chosen neurons, freq[i] is high and bias[i] is negative
		 *    bias[i] = _gamma*((1/this._networkSize)-freq[i])
		 *
		 * Original distance formula:
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
			var multiplier = (255 * 4) << NeuQuant._netbiasshift,
				bestd = ~(1 << 31), // TODO: Type: Double
				bestbiasd = bestd, // TODO: Type: Double
				bestpos = -1,
				bestbiaspos = bestpos;

			for (var i = 0; i < this._networkSize; i++) {
				var n = this._network[i];

				var dist = this._distance.calculateNormalized(<any>n, <any>{r : r, g : g, b : b, a : al}) * multiplier; // TODO: Type: Double

				if (dist < bestd) {
					bestd = dist;
					bestpos = i;
				}

				var biasdist = dist - ((this._bias[i]) >> (NeuQuant._intbiasshift - NeuQuant._netbiasshift));
				if (biasdist < bestbiasd) {
					bestbiasd = biasdist;
					bestbiaspos = i;
				}
				var betafreq = (this._freq[i] >> NeuQuant._betashift); // TODO: Type: Double
				this._freq[i] -= betafreq;
				this._bias[i] += (betafreq << NeuQuant._gammashift);
			}
			this._freq[bestpos] += NeuQuant._beta;
			this._bias[bestpos] -= NeuQuant._betagamma;
			return (bestbiaspos);
		}
	}
}
