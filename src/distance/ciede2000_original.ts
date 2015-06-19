/**
 * @preserve
 * Copyright (c) 2015, Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * ciede2000_original.ts - part of Image Quantization Library
 */
module IQ.Distance {

	/**
	 * CIEDE2000 algorithm (Original)
	 */
	export class CIEDE2000_Original implements IDistanceCalculator {
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

		private _whitePoint : {r : number; g : number; b : number; a : number};

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

		public calculateRawInLab(Lab1 : {L : number; a : number; b : number}, Lab2 : {L : number; a : number; b : number}) : number {
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

				G = 0.5 * (1 - Math.sqrt(pow_a_C1_C2_to_7 / (pow_a_C1_C2_to_7 + CIEDE2000_Original._pow25to7))), //(4)

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

				T = 1 - 0.17 * Math.cos(a_hp - CIEDE2000_Original._deg30InRad) +
					0.24 * Math.cos(2 * a_hp) +
					0.32 * Math.cos(3 * a_hp + CIEDE2000_Original._deg6InRad) -
					0.20 * Math.cos(4 * a_hp - CIEDE2000_Original._deg63InRad), //(15)

				d_ro = CIEDE2000_Original._deg30InRad * Math.exp(-Math.pow((a_hp - CIEDE2000_Original._deg275InRad) / CIEDE2000_Original._deg25InRad, 2)), //(16),
				pow_a_Cp_to_7 = Math.pow(a_Cp, 7.0),
				RC = Math.sqrt(pow_a_Cp_to_7 / (pow_a_Cp_to_7 + CIEDE2000_Original._pow25to7)),//(17)
				pow_a_L_minus_50_to_2 = Math.pow(a_L - 50, 2),
				SL = 1 + ((0.015 * pow_a_L_minus_50_to_2) / Math.sqrt(20 + pow_a_L_minus_50_to_2)),//(18)
				SC = 1 + 0.045 * a_Cp,//(19)
				SH = 1 + 0.015 * a_Cp * T,//(20)
				RT = -2 * RC * Math.sin(2 * d_ro),//(21)
				dE = Math.sqrt(Math.pow(dLp / (SL * CIEDE2000_Original._kL), 2) + Math.pow(dCp / (SC * CIEDE2000_Original._kC), 2) + Math.pow(dHp / (SH * CIEDE2000_Original._kH), 2) + RT * (dCp / (SC * CIEDE2000_Original._kC)) * (dHp / (SH * CIEDE2000_Original._kH))); //(22)

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

			return hPrime + CIEDE2000_Original._deg360InRad;
		}

		private _a_hp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(14)
			var hPrimeSum = h1p + h2p;
			if (C1 * C2 === 0) {
				return hPrimeSum;
			}

			if (Math.abs(h1p - h2p) <= CIEDE2000_Original._deg180InRad) {
				return hPrimeSum / 2.0;
			}

			if (hPrimeSum < CIEDE2000_Original._deg360InRad) {
				return (hPrimeSum + CIEDE2000_Original._deg360InRad) / 2.0;
			}

			return (hPrimeSum - CIEDE2000_Original._deg360InRad) / 2.0;
		}

		private _dhp_f(C1 : number, C2 : number, h1p : number, h2p : number) : number { //(10)
			if (C1 * C2 === 0) {
				return 0;
			}

			var h2p_minus_h1p = h2p - h1p;

			if (h2p_minus_h1p < -CIEDE2000_Original._deg180InRad) {
				return h2p_minus_h1p + CIEDE2000_Original._deg360InRad;
			}

			if (h2p_minus_h1p > CIEDE2000_Original._deg180InRad) {
				return h2p_minus_h1p - CIEDE2000_Original._deg360InRad;
			}

			return h2p_minus_h1p;
		}
	}
}
