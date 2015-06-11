/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * distance.ts - part of Image Quantization Library
 */

///<reference path="common.ts"/>
///<reference path="conversion.ts"/>
///<reference path="constants.ts"/>
module IQ.Color {

	// Perceptual Euclidean color distance
	export class DistanceEuclidean implements IDistanceCalculator {
		protected _Pr : number;
		protected _Pg : number;
		protected _Pb : number;
		protected _Pa : number;

		protected _maxEuclideanDistance : number;

		constructor() {
			this._setDefaults();

			// set default maximal color component deltas (255 - 0 = 255)
			this.setMaximalColorDeltas(255, 255, 255, 255);
		}

		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;

			// TODO: what is the best coef below?
			this._Pa = 1;
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
			return this._Pr * dR * dR + this._Pg * dG * dG + this._Pb * dB * dB + this._Pa * dA * dA;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxEuclideanDistance;
		}

		/**
		 * To simulate original RgbQuant distance you need to set `maxAlphaDelta = 0`
		 */
		public setMaximalColorDeltas(maxRedDelta : number, maxGreenDelta : number, maxBlueDelta : number, maxAlphaDelta : number) : void {
			this._maxEuclideanDistance = Math.sqrt(this.calculateRaw(maxRedDelta, maxGreenDelta, maxBlueDelta, maxAlphaDelta, 0, 0, 0, 0));
		}
	}

	// Perceptual Euclidean color distance
	export class DistanceEuclideanWuQuant extends DistanceEuclidean implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = this._Pg = this._Pb = this._Pa = 1;
		}
	}

	// Perceptual Euclidean color distance
	export class DistanceEuclideanRgbQuantWOAlpha extends DistanceEuclidean implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;
			this._Pa = 0;
		}
	}

	// Manhattan distance
	export class DistanceManhattan implements IDistanceCalculator {
		protected _Pr : number;
		protected _Pg : number;
		protected _Pb : number;
		protected _Pa : number;

		protected _maxManhattanDistance : number;

		constructor() {
			this._setDefaults();

			// set default maximal color component deltas (255 - 0 = 255)
			this.setMaximalColorDeltas(255, 255, 255, 255);
		}

		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;

			// TODO: what is the best coef below?
			this._Pa = 1;
		}

		public setMaximalColorDeltas(maxRedDelta : number, maxGreenDelta : number, maxBlueDelta : number, maxAlphaDelta : number) : void {
			this._maxManhattanDistance = this.calculateRaw(maxRedDelta, maxGreenDelta, maxBlueDelta, maxAlphaDelta, 0, 0, 0, 0);
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
			if (dR < 0) dR = 0 - dR;
			if (dG < 0) dG = 0 - dG;
			if (dB < 0) dB = 0 - dB;
			if (dA < 0) dA = 0 - dA;

			return this._Pr * dR + this._Pg * dG + this._Pb * dB + this._Pa * dA;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a) / this._maxManhattanDistance;
		}
	}

	// Manhattan distance (NeuQuant version) - w/o sRGB coefficients
	export class DistanceManhattanNeuQuant extends DistanceManhattan implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = this._Pg = this._Pb = this._Pa = 1;
		}
	}


	// CIEDE2000 algorithm
	export class DistanceCIEDE2000 implements IDistanceCalculator {
		public setMaximalColorDeltas(maxRedDelta : number, maxGreenDelta : number, maxBlueDelta : number, maxAlphaDelta : number) : void {
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var lab1 = Conversion.rgb2lab(r1, g1, b1),
				lab2 = Conversion.rgb2lab(r2, g2, b2),
				dA = a2 - a1;

			var dE = this.calculateRawInLab(lab1, lab2);
			return dE + dA * dA;
		}

		public calculateRawInLab(Lab1 : {L : number, a : number; b : number}, Lab2 : {L : number, a : number; b : number}) : number {
			// Get L,a,b values for color 1
			var L1 = Lab1.L;
			var a1 = Lab1.a;
			var b1 = Lab1.b;

			// Get L,a,b values for color 2
			var L2 = Lab2.L;
			var a2 = Lab2.a;
			var b2 = Lab2.b;

			// Weight factors
			var kL = 1;
			var kC = 1;
			var kH = 1;

			/**
			 * Step 1: Calculate C1p, C2p, h1p, h2p
			 */
			var C1      = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2)), //(2)
				C2      = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2)), //(2)

				a_C1_C2 = (C1 + C2) / 2.0,             //(3)

				G       = 0.5 * (1 - Math.sqrt(Math.pow(a_C1_C2, 7.0) / (Math.pow(a_C1_C2, 7.0) + Math.pow(25.0, 7.0)))), //(4)

				a1p     = (1.0 + G) * a1, //(5)
				a2p     = (1.0 + G) * a2, //(5)

				C1p     = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2)), //(6)
				C2p     = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2)), //(6)

				h1p     = this._hp_f(b1, a1p), //(7)
				h2p     = this._hp_f(b2, a2p); //(7)

			/**
			 * Step 2: Calculate dLp, dCp, dHp
			 */
			var dLp = L2 - L1, //(8)
				dCp = C2p - C1p, //(9)

				dhp = this._dhp_f(C1, C2, h1p, h2p), //(10)
				dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(this._radians(dhp) / 2.0); //(11)

			/**
			 * Step 3: Calculate CIEDE2000 Color-Difference
			 */
			var a_L  = (L1 + L2) / 2.0, //(12)
				a_Cp = (C1p + C2p) / 2.0, //(13)

				a_hp = this._a_hp_f(C1, C2, h1p, h2p), //(14)

				T    = 1 - 0.17 * Math.cos(this._radians(a_hp - 30)) + 0.24 * Math.cos(this._radians(2 * a_hp)) + 0.32 * Math.cos(this._radians(3 * a_hp + 6)) - 0.20 * Math.cos(this._radians(4 * a_hp - 63)), //(15)
				d_ro = 30 * Math.exp(-(Math.pow((a_hp - 275) / 25, 2))), //(16)
				RC   = Math.sqrt((Math.pow(a_Cp, 7.0)) / (Math.pow(a_Cp, 7.0) + Math.pow(25.0, 7.0))),//(17)
				SL   = 1 + ((0.015 * Math.pow(a_L - 50, 2)) / Math.sqrt(20 + Math.pow(a_L - 50, 2.0))),//(18)
				SC   = 1 + 0.045 * a_Cp,//(19)
				SH   = 1 + 0.015 * a_Cp * T,//(20)
				RT   = -2 * RC * Math.sin(this._radians(2 * d_ro)),//(21)
				dE   = Math.sqrt(Math.pow(dLp / (SL * kL), 2) + Math.pow(dCp / (SC * kC), 2) + Math.pow(dHp / (SH * kH), 2) + RT * (dCp / (SC * kC)) * (dHp / (SH * kH))); //(22)

			return dE * dE;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a));
		}

		private _degrees(n : number) : number {
			return n * (180 / Math.PI);
		}

		private _radians(n : number) : number {
			return n * (Math.PI / 180);
		}

		private _hp_f(x : number, y : number) { //(7)
			if (x === 0 && y === 0) {
				return 0;
			} else {
				var tmphp = this._degrees(Math.atan2(x, y));
				if (tmphp >= 0) {
					return tmphp
				} else {
					return tmphp + 360;
				}
			}
		}

		private _a_hp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(14)
			if (C1 * C2 === 0) {
				return h1p + h2p
			} else if (Math.abs(h1p - h2p) <= 180) {
				return (h1p + h2p) / 2.0;
			} else if (Math.abs(h1p - h2p) > 180 && h1p + h2p < 360) {
				return (h1p + h2p + 360) / 2.0;
			} else if ((Math.abs(h1p - h2p) > 180) && ((h1p + h2p) >= 360)) {
				return (h1p + h2p - 360) / 2.0;
			} else                                                throw(new Error());
		}

		private _dhp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(10)
			if (C1 * C2 === 0) {
				return 0;
			} else if (Math.abs(h2p - h1p) <= 180) {
				return h2p - h1p;
			} else if (h2p - h1p > 180) {
				return (h2p - h1p) - 360;
			} else if (h2p - h1p < -180) {
				return (h2p - h1p) + 360;
			} else {
				throw new Error();
			}
		}
	}

	/*
	 * Computes CIE94 distance between 2 colors in LAB space.
	 *
	 * p1 = [l1, a1, b1]
	 * p2 = [l2, a2, b2]
	 * Returns distance:float
	 *
	 * Usage example:
	 *     var d = CIE94_dist([94.0, -0.1, -0.55], [77.0, 0.5, 0.45])
	 *
	 * Iulius Curt, april 2013
	 */

	//export var tL = 0, ta = 0, tb = 0;
	 export class DistanceCIE94 implements IDistanceCalculator {
		 protected _maxCIE94Distance : number;

		 constructor() {
			 // set default maximal color component deltas (255 - 0 = 255)
			 this.setMaximalColorDeltas(255, 255, 255, 255);
		 }

		 public setMaximalColorDeltas(maxRedDelta : number, maxGreenDelta : number, maxBlueDelta : number, maxAlphaDelta : number) : void {
			 this._maxCIE94Distance = 200;
		 }

		 public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			 var lab1 = Conversion.rgb2lab(r1, g1, b1),
				 lab2 = Conversion.rgb2lab(r2, g2, b2);

/*
			 if(tL < lab1.L) {
				 tL = lab1.L;
				 console.log("L = " + tL);
			 }
			 if(ta < lab1.a) {
				 ta = lab1.a;
				 console.log("a = " + ta);
			 }
			 if(tb < lab1.b) {
				 tb = lab1.b;
				 console.log("b = " + tb);
			 }

*/
			 var Kl = 2.0, K1 = 0.048, K2 = 0.014;

			 var dL     = lab1.L - lab2.L,
				 dA     = lab1.a - lab2.a,
				 dB     = lab1.b - lab2.b,
				 c1     = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b),
				 c2     = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b),
				 dC     = c1 - c2,
				 deltaH = dA * dA + dB * dB - dC * dC;

			 deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

			 var i = Math.pow(dL / Kl, 2) + Math.pow(dC / (1.0 + K1 * c1), 2) + Math.pow(deltaH / (1.0 + K2 * c1), 2);
			 return i < 0 ? 0 : i;
		 }

		 public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			 return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxCIE94Distance;
		 }
	 }

	// TODO: Name it: http://www.compuphase.com/cmetric.htm
	export class DistanceCMETRIC implements IDistanceCalculator {
		protected _max : number;

		constructor() {
			this._max = Math.sqrt(this.calculateRaw(0, 0, 0, 0,255,255,255,255));
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var rmean = ( r1 + r2 ) >> 1,
				r = r1 - r2,
				g = g1 - g2,
				b = b1 - b2;

			return ((((512+rmean)*r*r)>>8) + 4*g*g + (((767-rmean)*b*b)>>8));
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			var r = Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a));
			if(r > this._max) {
				this._max = r;
				console.log(r, colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a);
			}
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._max;
		}

		/**
		 * To simulate original RgbQuant distance you need to set `maxAlphaDelta = 0`
		 */
		public setMaximalColorDeltas(maxRedDelta : number, maxGreenDelta : number, maxBlueDelta : number, maxAlphaDelta : number) : void {
			this._max = Math.sqrt(this.calculateRaw(0, 0, 0, 0, maxRedDelta, maxGreenDelta, maxBlueDelta, maxAlphaDelta));
		}
	}

	/*
	 Finally, I've found it! After thorough testing and experimentation my conclusions are:

	 The correct way is to calculate maximum possible difference between the two colors.
	 Formulas with any kind of estimated average/typical difference had room for non-linearities.

	 I was unable to find correct formula that calculates the distance without blending RGBA colors with backgrounds.

	 There is no need to take every possible background color into account, only extremes per R/G/B channel, i.e. for red channel:

	 blend both colors with 0 red as background, measure squared difference
	 blend both colors with max red background, measure squared difference
	 take higher of the two.
	 Fortunately blending with "white" and "black" is trivial when you use premultiplied alpha (r = r×a).

	 The complete formula is:
	 max((r?-r?)², (r?-r? - a?+a?)²) +
	 max((g?-g?)², (g?-g? - a?+a?)²) +
	 max((b?-b?)², (b?-b? - a?+a?)²)
	 */
	/*
	 function colordifference_ch(x, y, alphas) {
	 // maximum of channel blended on white, and blended on black
	 // premultiplied alpha and backgrounds 0/1 shorten the formula
	 var black = x - y, // [-255; 255]
	 white = black + alphas; // [-255; 255*2]

	 return Math.max(black * black, white * white); // [0; 255^2 + (255*2)^2]
	 }

	 //var rgbaMax = (255*255 + (255*2) * (255*2)) * 3;
	 var rgbaMax = Math.pow(255 << 1, 2) * 3;

	 function distRGBA(rgb0, rgb1) {
	 /!*
	 var r1 = rgb0[0],
	 g1 = rgb0[1],
	 b1 = rgb0[2],
	 a1 = rgb0[3];

	 var r2 = rgb1[0],
	 g2 = rgb1[1],
	 b2 = rgb1[2],
	 a2 = rgb1[3];

	 var dr = r1 - r2,
	 dg = g1 - g2,
	 db = b1 - b2,
	 da = a1 - a2;

	 return (Math.max(dr << 1, dr - da << 1) +
	 Math.max(dg << 1, dg - da << 1) +
	 Math.max(db << 1, db - da << 1)) / rgbaMax;

	 *!/
	 var alphas = rgb1[ 3 ] - rgb0[ 3 ],
	 dist = colordifference_ch(rgb0[ 0 ], rgb1[ 0 ], alphas) +
	 colordifference_ch(rgb0[ 1 ], rgb1[ 1 ], alphas) +
	 colordifference_ch(rgb0[ 2 ], rgb1[ 2 ], alphas);

	 if (dist > rgbaMax) {
	 console.log(dist);
	 }

	 return dist / rgbaMax;
	 }
	 */

}
