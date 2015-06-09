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
	/* number of colours used */

	/*
	 four primes near 500 - assume no image has a length so large
	 that it is divisible by all four primes
	 */

	var bytesPerPoint   = 3,
		prime1          = 499,
		prime2          = 491,
		prime3          = 487,
		prime4          = 503,
		minpicturebytes = (bytesPerPoint * prime4);

	// bias for colour values
	var netbiasshift = 4;

	// no. of learning cycles
	var ncycles = 100;

	// defs for freq and bias
	var intbiasshift = 16;

	// bias for fractions
	var intbias    = (1 << intbiasshift),
		gammashift = 10;

	// gamma = 1024
	var gamma     = (1 << gammashift),
		betashift = 10,
		beta      = (intbias >> betashift);

	// beta = 1/1024
	var betagamma = (intbias << (gammashift - betashift));

	/*
	 * for 256 cols, radius starts
	 */
	var radiusbiasshift = 6;

	// at 32.0 biased by 6 bits
	var radiusbias = 1 << radiusbiasshift;

	/*
	 * and
	 * decreases
	 * by a
	 */

	// factor of 1/30 each cycle
	var radiusdec = 30;

	/* defs for decreasing alpha factor */

	// alpha starts at 1.0
	var alphabiasshift = 10;

	// biased by 10 bits
	var initalpha = (1 << alphabiasshift);

	/* radbias and alpharadbias used for radpower calculation */
	var radbiasshift   = 8,
		radbias        = 1 << radbiasshift,
		alpharadbshift = alphabiasshift + radbiasshift,
		alpharadbias   = 1 << alpharadbshift;

	class Neuron {
		public r;
		public g;
		public b;
		public a;

		constructor(defaultValue) {
			this.r = this.g = this.b = this.a = defaultValue;
		}

		public toPoint() : Utils.Point {
			return Utils.Point.createByRGBA(this.r | 0, this.g | 0, this.b | 0, this.a | 0);
		}
	}

	export class NeuQuant implements IPaletteQuantizer {
		private _pointArray : Utils.Point[];
		private _networkSize : number;
		private _network : Neuron[];

		/** sampling factor 1..30 */
		private _sampleFactor : number;
		private _radPower : number[];

		// bias and freq arrays for learning
		private _freq : number[];

		/* for network lookup - really 256 */
		private _bias : number[];
		private _distance : Color.IDistanceCalculator;

		constructor(colorDistanceCalculator : Color.IDistanceCalculator, colors : number = 256) {
			this._distance = colorDistanceCalculator;
			this._pointArray = [];
			this._sampleFactor = 1;
			this._networkSize = colors;

			this._distance.setMaximalColorDeltas(255 << netbiasshift, 255 << netbiasshift, 255 << netbiasshift, 255 << netbiasshift);
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
				this._network[i] = new Neuron((i << (netbiasshift + 8)) / this._networkSize);

				// 1/this._networkSize
				this._freq[i] = intbias / this._networkSize;
				this._bias[i] = 0;
			}
		}

		/**
		 * Main Learning Loop
		 */
		private _learn() : void {
			var i, radius, rad, alpha, step, delta, samplepixels, pix, lim;

			var lengthcount = this._pointArray.length * 3;
			if (lengthcount < minpicturebytes) this._sampleFactor = 1;

			var alphadec = 30 + ((this._sampleFactor - 1) / 3);
			pix = 0;
			lim = lengthcount;
			samplepixels = lengthcount / (bytesPerPoint * this._sampleFactor);
			delta = (samplepixels / ncycles) | 0;
			alpha = initalpha;
			radius = (this._networkSize >> 3) * radiusbias;

			rad = radius >> radiusbiasshift;
			if (rad <= 1) rad = 0;

			for (i = 0; i < rad; i++) this._radPower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));

			if (lengthcount < minpicturebytes) {
				step = bytesPerPoint;
			} else if (lengthcount % prime1 != 0) {
				step = bytesPerPoint * prime1;
			} else if ((lengthcount % prime2) != 0) {
				step = bytesPerPoint * prime2;
			} else if ((lengthcount % prime3) != 0) {
				step = bytesPerPoint * prime3;
			} else {
				step = bytesPerPoint * prime4;
			}

			i = 0;
			while (i < samplepixels) {
				var point = this._pointArray[pix / bytesPerPoint],
					b     = point.b << netbiasshift,
					g     = point.g << netbiasshift,
					r     = point.r << netbiasshift,
					a     = point.a << netbiasshift,
					j     = this._contest(b, g, r, a);

				this._altersingle(alpha, j, b, g, r, a);

				if (rad != 0) this._alterneigh(rad, j, b, g, r, a);

				/* alter neighbours */
				pix += step;
				if (pix >= lim) pix -= lengthcount;
				i++;

				if (delta == 0) delta = 1;

				if (i % delta == 0) {
					alpha -= alpha / alphadec;
					radius -= radius / radiusdec;
					rad = radius >> radiusbiasshift;

					if (rad <= 1) rad = 0;
					for (j = 0; j < rad; j++) this._radPower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
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
				neuron.b >>= netbiasshift;
				neuron.g >>= netbiasshift;
				neuron.r >>= netbiasshift;
				neuron.a >>= netbiasshift;
			}
		}

		/**
		 * Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2)) in radpower[|i-j|]
		 */
		private _alterneigh(rad, i, b, g, r, al) : void {
			var j, k, lo, hi, a, m, p;

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
					p.b -= (a * (p.b - b)) / alpharadbias;
					p.g -= (a * (p.g - g)) / alpharadbias;
					p.r -= (a * (p.r - r)) / alpharadbias;
					p.a -= (a * (p.a - al)) / alpharadbias;
				}

				if (k > lo) {
					p = this._network[k--];
					p.b -= (a * (p.b - b)) / alpharadbias;
					p.g -= (a * (p.g - g)) / alpharadbias;
					p.r -= (a * (p.r - r)) / alpharadbias;
					p.a -= (a * (p.a - al)) / alpharadbias;
				}
			}
		}

		/**
		 * Move neuron i towards biased (b,g,r) by factor alpha
		 */
		private _altersingle(alpha, i, b, g, r, a) : void {
			/* alter hit neuron */
			var n = this._network[i];
			n.b -= (alpha * (n.b - b)) / initalpha;
			n.g -= (alpha * (n.g - g)) / initalpha;
			n.r -= (alpha * (n.r - r)) / initalpha;
			n.a -= (alpha * (n.a - a)) / initalpha;
		}

		/**
		 * Search for biased BGR values
		 * description:
		 *    finds closest neuron (min dist) and updates freq
		 *    finds best neuron (min dist-bias) and returns position
		 *    for frequently chosen neurons, freq[i] is high and bias[i] is negative
		 *    bias[i] = gamma*((1/this._networkSize)-freq[i])
		 *
		 * Original distance formula:
		 * 		dist = n.b - b;
		 * 		if (dist < 0) dist = -dist;
		 * 		a = n.g - g;
		 * 		if (a < 0) a = -a;
		 * 		dist += a;
		 * 		a = n.r - r;
		 * 		if (a < 0) a = -a;
		 * 		dist += a;
		 * 		a = (n.a - al);
		 * 		if (a < 0) a = -a;
		 * 		dist += a;
		*/
		private _contest(b, g, r, al) : number {
			var multiplier  = (255 * 4) << netbiasshift,
				bestd       = ~(1 << 31),
				bestbiasd   = bestd,
				bestpos     = -1,
				bestbiaspos = bestpos;

			for (var i = 0; i < this._networkSize; i++) {
				var n = this._network[i];

				var dist = this._distance.calculateNormalized(<any>n, <any>{ r : r, g : g, b : b, a : al}) * multiplier;

				if (dist < bestd) {
					bestd = dist;
					bestpos = i;
				}

				var biasdist = dist - ((this._bias[i]) >> (intbiasshift - netbiasshift));
				if (biasdist < bestbiasd) {
					bestbiasd = biasdist;
					bestbiaspos = i;
				}
				var betafreq = (this._freq[i] >> betashift);
				this._freq[i] -= betafreq;
				this._bias[i] += (betafreq << gammashift);
			}
			this._freq[bestpos] += beta;
			this._bias[bestpos] -= betagamma;
			return (bestbiaspos);
		}
	}
}
