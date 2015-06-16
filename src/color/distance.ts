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
///<reference path="../utils/arithmetic.ts"/>
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
			this.setWhitePoint(255, 255, 255, 255);
		}

		/**
		 * To simulate original RgbQuant distance use `r=255,g=255,b=255,a=0`
		 */
		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._maxEuclideanDistance = Math.sqrt(this.calculateRaw(r, g, b, a, 0, 0, 0, 0));
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
			return this._Pr * dR * dR + this._Pg * dG * dG + this._Pb * dB * dB + this._Pa * dA * dA;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxEuclideanDistance;
		}

		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;

			// TODO: what is the best coef below?
			this._Pa = 1;
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
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._maxManhattanDistance = this.calculateRaw(r, g, b, a, 0, 0, 0, 0);
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a) / this._maxManhattanDistance;
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var dR = r2 - r1, dG = g2 - g1, dB = b2 - b1, dA = a2 - a1;
			if (dR < 0) dR = 0 - dR;
			if (dG < 0) dG = 0 - dG;
			if (dB < 0) dB = 0 - dB;
			if (dA < 0) dA = 0 - dA;

			return this._Pr * dR + this._Pg * dG + this._Pb * dB + this._Pa * dA;
		}

		protected _setDefaults() : void {
			this._Pr = Constants.sRGB.Y.RED;
			this._Pg = Constants.sRGB.Y.GREEN;
			this._Pb = Constants.sRGB.Y.BLUE;

			// TODO: what is the best coef below?
			this._Pa = 1;
		}
	}

	// Manhattan distance (NeuQuant version) - w/o sRGB coefficients
	export class DistanceManhattanNeuQuant extends DistanceManhattan implements IDistanceCalculator {
		protected _setDefaults() : void {
			this._Pr = this._Pg = this._Pb = this._Pa = 1;
		}
	}

	/**
	 * CIEDE2000 algorithm (Original)
	 */
	export class DistanceCIEDE2000_Original implements IDistanceCalculator {
		private static _kL : number = 1;
		private static _kC : number = 1;
		private static _kH : number = 1;
		private static _pow25to7 : number = Math.pow(25, 7);
		private static _deg360InRad : number = Arithmetic.degrees2radians(360);
		private static _deg180InRad : number = Arithmetic.degrees2radians(180);
		private static _deg30InRad : number = Arithmetic.degrees2radians(30);
		private static _deg6InRad : number = Arithmetic.degrees2radians(6);
		private static _deg63InRad : number = Arithmetic.degrees2radians(63);
		private static _deg275InRad : number = Arithmetic.degrees2radians(275);
		private static _deg25InRad : number = Arithmetic.degrees2radians(25);

		private _whitePoint : {r : number; g : number, b : number; a : number};

		constructor() {
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._whitePoint = {r : r, g : g, b : b, a : a};
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var lab1 = Conversion.rgb2lab(r1 / this._whitePoint.r, g1 / this._whitePoint.g, b1 / this._whitePoint.b),
				lab2 = Conversion.rgb2lab(r2 / this._whitePoint.r, g2 / this._whitePoint.g, b2 / this._whitePoint.b),
				dA = (a2 - a1) / this._whitePoint.a;

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
			/**
			 * Step 1: Calculate C1p, C2p, h1p, h2p
			 */
			var C1 = Math.sqrt(a1 * a1 + b1 * b1), //(2)
				C2 = Math.sqrt(a2 * a2 + b2 * b2), //(2)

				pow_a_C1_C2_to_7 = Math.pow((C1 + C2) / 2.0, 7.0),             //(3)

				G = 0.5 * (1 - Math.sqrt(pow_a_C1_C2_to_7 / (pow_a_C1_C2_to_7 + DistanceCIEDE2000_Original._pow25to7))), //(4)

				a1p = (1.0 + G) * a1, //(5)
				a2p = (1.0 + G) * a2, //(5)

				C1p = Math.sqrt(a1p * a1p + b1 * b1), //(6)
				C2p = Math.sqrt(a2p * a2p + b2 * b2), //(6)

				h1p = this._hp_f(b1, a1p), //(7)
				h2p = this._hp_f(b2, a2p); //(7)

			/**
			 * Step 2: Calculate dLp, dCp, dHp
			 */
			var dLp = L2 - L1, //(8)
				dCp = C2p - C1p, //(9)

				dhp = this._dhp_f(C1, C2, h1p, h2p), //(10)
				dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2.0); //(11)

			/**
			 * Step 3: Calculate CIEDE2000 Color-Difference
			 */
			var a_L = (L1 + L2) / 2.0, //(12)
				a_Cp = (C1p + C2p) / 2.0, //(13)

				a_hp = this._a_hp_f(C1, C2, h1p, h2p), //(14)

				T = 1 - 0.17 * Math.cos(a_hp - DistanceCIEDE2000_Original._deg30InRad) +
					0.24 * Math.cos(2 * a_hp) +
					0.32 * Math.cos(3 * a_hp + DistanceCIEDE2000_Original._deg6InRad) -
					0.20 * Math.cos(4 * a_hp - DistanceCIEDE2000_Original._deg63InRad), //(15)

				d_ro = DistanceCIEDE2000_Original._deg30InRad * Math.exp(-Math.pow((a_hp - DistanceCIEDE2000_Original._deg275InRad) / DistanceCIEDE2000_Original._deg25InRad, 2)), //(16),
				pow_a_Cp_to_7 = Math.pow(a_Cp, 7.0),
				RC = Math.sqrt(pow_a_Cp_to_7 / (pow_a_Cp_to_7 + DistanceCIEDE2000_Original._pow25to7)),//(17)
				pow_a_L_minus_50_to_2 = Math.pow(a_L - 50, 2),
				SL = 1 + ((0.015 * pow_a_L_minus_50_to_2) / Math.sqrt(20 + pow_a_L_minus_50_to_2)),//(18)
				SC = 1 + 0.045 * a_Cp,//(19)
				SH = 1 + 0.015 * a_Cp * T,//(20)
				RT = -2 * RC * Math.sin(2 * d_ro),//(21)
				dE = Math.sqrt(Math.pow(dLp / (SL * DistanceCIEDE2000_Original._kL), 2) + Math.pow(dCp / (SC * DistanceCIEDE2000_Original._kC), 2) + Math.pow(dHp / (SH * DistanceCIEDE2000_Original._kH), 2) + RT * (dCp / (SC * DistanceCIEDE2000_Original._kC)) * (dHp / (SH * DistanceCIEDE2000_Original._kH))); //(22)

			return dE * dE;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a));
		}

		private _hp_f(b : number, aPrime : number) { //(7)
			if (b === 0 && aPrime === 0) {
				return 0;
			}

			var hPrime = Math.atan2(b, aPrime);
			if (hPrime >= 0) {
				return hPrime;
			}

			return hPrime + DistanceCIEDE2000_Original._deg360InRad;
		}

		private _a_hp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(14)
			var hPrimeSum = h1p + h2p;
			if (C1 * C2 === 0) {
				return hPrimeSum;
			}

			if (Math.abs(h1p - h2p) <= DistanceCIEDE2000_Original._deg180InRad) {
				return hPrimeSum / 2.0;
			}

			if (hPrimeSum < DistanceCIEDE2000_Original._deg360InRad) {
				return (hPrimeSum + DistanceCIEDE2000_Original._deg360InRad) / 2.0;
			}

			return (hPrimeSum - DistanceCIEDE2000_Original._deg360InRad) / 2.0;
		}

		private _dhp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(10)
			if (C1 * C2 === 0) {
				return 0;
			}

			var h2p_minus_h1p = h2p - h1p;

			if (h2p_minus_h1p < -DistanceCIEDE2000_Original._deg180InRad) {
				return h2p_minus_h1p + DistanceCIEDE2000_Original._deg360InRad;
			}

			if (h2p_minus_h1p > DistanceCIEDE2000_Original._deg180InRad) {
				return h2p_minus_h1p - DistanceCIEDE2000_Original._deg360InRad;
			}

			return h2p_minus_h1p;
		}
	}

	/**
	 * CIEDE2000 algorithm (optimized)
	 *
	 */
	export class DistanceCIEDE2000 implements IDistanceCalculator {
		private static _kL : number = 1;
		private static _kC : number = 1;
		private static _kH : number = 1;
		private static _pow25to7 : number = Math.pow(25, 7);
		private static _deg360InRad : number = Arithmetic.degrees2radians(360);
		private static _deg180InRad : number = Arithmetic.degrees2radians(180);
		private static _deg30InRad : number = Arithmetic.degrees2radians(30);
		private static _deg6InRad : number = Arithmetic.degrees2radians(6);
		private static _deg63InRad : number = Arithmetic.degrees2radians(63);

		private _whitePoint : {r : number; g : number, b : number; a : number};

		constructor() {
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._whitePoint = {r : r, g : g, b : b, a : a};
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var lab1 = Conversion.rgb2lab(r1 / this._whitePoint.r, g1 / this._whitePoint.g, b1 / this._whitePoint.b),
				lab2 = Conversion.rgb2lab(r2 / this._whitePoint.r, g2 / this._whitePoint.g, b2 / this._whitePoint.b),
				dA = (a2 - a1) / this._whitePoint.a;

			var dE = this.calculateRawInLab(lab1, lab2);
			return dE + dA * dA;
		}

		/**
		 * @description
		 *   minDistance between any color (CIEDE2000 low limit) = 0.00021155740497634713 (Chrome 46, JavaScript)
		 *   !!!!!! max (RT * (dCp / (SC * DistanceCIEDE2000._kC)) * (dHp / (SH * DistanceCIEDE2000._kH))) 0.0000019135101965161994
		 *   max (abs(dE (correct RT) - dE (RT = 0) ) ) is always less than minDistance (0.0000019135101965161994)
		 *
		 *   So, we can remove RT from equation.
		 */
		public calculateRawInLab(Lab1 : {L : number, a : number; b : number}, Lab2 : {L : number, a : number; b : number}) : number {
			// Get L,a,b values for color 1
			var L1 = Lab1.L,
				a1 = Lab1.a,
				b1 = Lab1.b;

			// Get L,a,b values for color 2
			var L2 = Lab2.L,
				a2 = Lab2.a,
				b2 = Lab2.b;

			// Weight factors
			/**
			 * Step 1: Calculate C1p, C2p, h1p, h2p
			 */
			var C1 = Math.sqrt(a1 * a1 + b1 * b1), //(2)
				C2 = Math.sqrt(a2 * a2 + b2 * b2), //(2)

				pow_a_C1_C2_to_7 = Math.pow((C1 + C2) / 2.0, 7.0),             //(3)

				G = 0.5 * (1 - Math.sqrt(pow_a_C1_C2_to_7 / (pow_a_C1_C2_to_7 + DistanceCIEDE2000._pow25to7))), //(4)

				a1p = (1.0 + G) * a1, //(5)
				a2p = (1.0 + G) * a2, //(5)

				C1p = Math.sqrt(a1p * a1p + b1 * b1), //(6)
				C2p = Math.sqrt(a2p * a2p + b2 * b2), //(6)

				h1p = this._hp_f(b1, a1p), //(7)
				h2p = this._hp_f(b2, a2p); //(7)

			/**
			 * Step 2: Calculate dLp, dCp, dHp
			 */
			var dLp = L2 - L1, //(8)
				dCp = C2p - C1p, //(9)

				dhp = this._dhp_f(C1, C2, h1p, h2p), //(10)
				dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2.0); //(11)

			/**
			 * Step 3: Calculate CIEDE2000 Color-Difference
			 */
			var a_L = (L1 + L2) / 2.0, //(12)
				a_Cp = (C1p + C2p) / 2.0, //(13)

				a_hp = this._a_hp_f(C1, C2, h1p, h2p), //(14)

				T = 1 - 0.17 * Math.cos(a_hp - DistanceCIEDE2000._deg30InRad) +
					0.24 * Math.cos(2 * a_hp) +
					0.32 * Math.cos(3 * a_hp + DistanceCIEDE2000._deg6InRad) -
					0.20 * Math.cos(4 * a_hp - DistanceCIEDE2000._deg63InRad), //(15)

				pow_a_L_minus_50_to_2 = Math.pow(a_L - 50, 2),
				SL = 1 + (0.015 * pow_a_L_minus_50_to_2) / Math.sqrt(20 + pow_a_L_minus_50_to_2),//(18)
				SC = 1 + 0.045 * a_Cp,//(19)
				SH = 1 + 0.015 * a_Cp * T,//(20)
				dE = Math.sqrt(Math.pow(dLp / (SL * DistanceCIEDE2000._kL), 2) + Math.pow(dCp / (SC * DistanceCIEDE2000._kC), 2) + Math.pow(dHp / (SH * DistanceCIEDE2000._kH), 2)); //(22)

			return dE * dE;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a));
		}

		private _hp_f(b : number, aPrime : number) { //(7)
			if (b === 0 && aPrime === 0) {
				return 0;
			}

			var hPrime = Math.atan2(b, aPrime);
			if (hPrime >= 0) {
				return hPrime;
			}

			return hPrime + DistanceCIEDE2000._deg360InRad;
		}

		private _a_hp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(14)
			var hPrimeSum = h1p + h2p;
			var h1p_minus_h2p = h1p - h2p;
			if (C1 * C2 === 0) {
				return hPrimeSum;
			}

			if (h1p_minus_h2p >= -DistanceCIEDE2000._deg180InRad && h1p_minus_h2p <= DistanceCIEDE2000._deg180InRad) {
				return hPrimeSum / 2.0;
			}

			if (hPrimeSum < DistanceCIEDE2000._deg360InRad) {
				return (hPrimeSum + DistanceCIEDE2000._deg360InRad) / 2.0;
			}

			return (hPrimeSum - DistanceCIEDE2000._deg360InRad) / 2.0;
		}

		private _dhp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(10)
			if (C1 * C2 === 0) {
				return 0;
			}

			var h2p_minus_h1p = h2p - h1p;

			if (h2p_minus_h1p < -DistanceCIEDE2000._deg180InRad) {
				return h2p_minus_h1p + DistanceCIEDE2000._deg360InRad;
			}

			if (h2p_minus_h1p > DistanceCIEDE2000._deg180InRad) {
				return h2p_minus_h1p - DistanceCIEDE2000._deg360InRad;
			}

			return h2p_minus_h1p;
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
		private static _Kl = 2.0;
		private static _K1 = 0.048;
		private static _K2 = 0.014;

		private _whitePoint : {r : number; g : number, b : number; a : number};
		private _maxCIE94Distance : number;

		constructor() {
			// set default maximal color component deltas (255 - 0 = 255)
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._whitePoint = {r : r, g : g, b : b, a : a};
			this._maxCIE94Distance = 200;
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var lab1 = Conversion.rgb2lab(r1 / this._whitePoint.r, g1 / this._whitePoint.g, b1 / this._whitePoint.b),
				lab2 = Conversion.rgb2lab(r2 / this._whitePoint.r, g2 / this._whitePoint.g, b2 / this._whitePoint.b);

			var dL = lab1.L - lab2.L,
				dA = lab1.a - lab2.a,
				dB = lab1.b - lab2.b,
				c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b),
				c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b),
				dC = c1 - c2,
				deltaH = dA * dA + dB * dB - dC * dC;

			deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

			var i = Math.pow(dL / DistanceCIE94._Kl, 2) + Math.pow(dC / (1.0 + DistanceCIE94._K1 * c1), 2) + Math.pow(deltaH / (1.0 + DistanceCIE94._K2 * c1), 2);
			return i < 0 ? 0 : i;
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxCIE94Distance;
		}
	}

	// TODO: Name it: http://www.compuphase.com/cmetric.htm
	export class DistanceCMETRIC implements IDistanceCalculator {
		private _rCoefficient : number;
		private _gCoefficient : number;
		private _bCoefficient : number;
		private _aCoefficient : number;
		private _maxDistance : number;

		constructor() {
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._rCoefficient = 255 / r;
			this._gCoefficient = 255 / g;
			this._bCoefficient = 255 / b;
			this._aCoefficient = 255 / a;
			this._maxDistance = Math.sqrt(this.calculateRaw(0, 0, 0, 0, r, g, b, a));
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			var rmean = ( r1 + r2 ) / 2 * this._rCoefficient,
				r = (r1 - r2) * this._rCoefficient,
				g = (g1 - g2) * this._gCoefficient,
				b = (b1 - b2) * this._bCoefficient,
				dE = ((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8)),
				dA = (a2 - a1) * this._aCoefficient;

			return (dE + dA * dA);
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return Math.sqrt(this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a)) / this._maxDistance;
		}

	}

	/**
	 * TODO: check quality of this distance equation
	 * TODO: ask author for usage rights
	 * taken from:
	 * {@link http://stackoverflow.com/questions/4754506/color-similarity-distance-in-rgba-color-space/8796867#8796867}
	 * {@link https://github.com/pornel/pngquant/blob/cc39b47799a7ff2ef17b529f9415ff6e6b213b8f/lib/pam.h#L148}
	 */
	export class DistancePNGQUANT implements IDistanceCalculator {

		private _whitePoint : {r : number; g : number, b : number; a : number};
		private _maxDistance : number;

		constructor() {
			this.setWhitePoint(255, 255, 255, 255);
		}

		public setWhitePoint(r : number, g : number, b : number, a : number) : void {
			this._whitePoint = {r : r, g : g, b : b, a : a};
			this._maxDistance = this.calculateRaw(0, 0, 0, 0, r, g, b, a);
		}

		public calculateNormalized(colorA : Utils.Point, colorB : Utils.Point) : number {
			return this.calculateRaw(colorA.r, colorA.g, colorA.b, colorA.a, colorB.r, colorB.g, colorB.b, colorB.a) / this._maxDistance;
		}

		private _colordifference_ch(x : number, y : number, alphas : number) {
			// maximum of channel blended on white, and blended on black
			// premultiplied alpha and backgrounds 0/1 shorten the formula
			var black = x - y,
				white = black + alphas;

			return black * black + white * white;
		}

		public calculateRaw(r1 : number, g1 : number, b1 : number, a1 : number, r2 : number, g2 : number, b2 : number, a2 : number) : number {
			// px_b.rgb = px.rgb + 0*(1-px.a) // blend px on black
			// px_b.a   = px.a   + 1*(1-px.a)
			// px_w.rgb = px.rgb + 1*(1-px.a) // blend px on white
			// px_w.a   = px.a   + 1*(1-px.a)

			// px_b.rgb = px.rgb              // difference same as in opaque RGB
			// px_b.a   = 1
			// px_w.rgb = px.rgb - px.a       // difference simplifies to formula below
			// px_w.a   = 1

			// (px.rgb - px.a) - (py.rgb - py.a)
			// (px.rgb - py.rgb) + (py.a - px.a)

			var alphas = (a2 - a1) / this._whitePoint.a;
			return this._colordifference_ch(r1 / this._whitePoint.r, r2 / this._whitePoint.r, alphas) +
				this._colordifference_ch(g1 / this._whitePoint.g, g2 / this._whitePoint.g, alphas) +
				this._colordifference_ch(b1 / this._whitePoint.b, b2 / this._whitePoint.b, alphas);
		}


	}
}
