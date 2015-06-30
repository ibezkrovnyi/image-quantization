/**
 * @preserve
 * Copyright 2015 Igor Bezkrovny
 * All rights reserved. (MIT Licensed)
 *
 * pointContainer.ts - part of Image Quantization Library
 */

/// <reference path='./point.ts' />
// TODO: refactor - move typings to common folder
///<reference path="../../test/typings/node/node.d.ts"/>
module IQ.Utils {

	/**
	 * v8 optimizations done.
	 * fromXXX methods are static to move out polymorphic code from class instance itself.
	 */
	export class PointContainer {
		private _pointArray : Point[];
		private _width : number;
		private _height : number;

		constructor(width : number, height : number = 1) {
			this._width = width;
			this._height = height;
			this._pointArray = [];
		}

		public getWidth() : number {
			return this._width;
		}

		public getHeight() : number {
			return this._height;
		}

		// TODO: refactor - do we need this method?
		public setWidth(width : number) : void {
			this._width = width;
		}
/*

		public setHeight(height : number) : void {
			this._height = height;
		}
*/

		public getIndex(x : number, y : number = 0) : number {
			return x + y * this._width;
		}

		public setAt(color : Point, x : number, y : number = 0) : void {
			this.setAtIndex(color, this.getIndex(x, y));
		}

		public setAtIndex(color : Point, index : number) : void {
			this._enlargeTo(index + 1);
			this._pointArray[index].from(color);
		}

		public getAt(x : number, y : number = 0) : Point {
			return this.getAtIndex(this.getIndex(x, y));
		}

		public getAtIndex(index : number) : Point {
			this._enlargeTo(index + 1);
			return this._pointArray[index];
		}

		private _enlargeTo(size : number) : void {
			for(var i = this._pointArray.length; i < size; i++) {
				this._pointArray[i] = new Point();
			}
		}

		public getPointArray() : Point[] {
			return this._pointArray;
		}

		public clone() : PointContainer {
			var clone = new PointContainer(this._width, this._height);

			clone._pointArray = [];
			for(var i = 0, l = this._pointArray.length; i < l; i++) {
				clone._pointArray[i] = Point.createByUint32(this._pointArray[i].uint32 | 0); // "| 0" is added for v8 optimization
			}

			return clone;
		}

		public toUint32Array() : Uint32Array {
			var l = this._pointArray.length,
				uint32Array = new Uint32Array(l);

			for(var i = 0; i < l; i++) {
				uint32Array[i] = this._pointArray[i].uint32;
			}

			return uint32Array;
		}

		public toUint8Array() : Uint8Array {
			return new Uint8Array(this.toUint32Array().buffer);
		}

		static fromHTMLImageElement(img : HTMLImageElement) : PointContainer {
			var width = img.naturalWidth,
				height = img.naturalHeight;

			var canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, width,height, 0, 0, width, height);

			return PointContainer.fromHTMLCanvasElement(canvas);
		}

		static fromHTMLCanvasElement(canvas : HTMLCanvasElement) : PointContainer {
			var width = canvas.width,
				height = canvas.height;

			var ctx = <CanvasRenderingContext2D>canvas.getContext("2d"),
				imgData = ctx.getImageData(0, 0, width, height);

			return PointContainer.fromImageData(imgData);
		}

		static fromNodeCanvas(canvas : any) : PointContainer {
			return PointContainer.fromHTMLCanvasElement(canvas);
		}

		static fromImageData(imageData : ImageData) : PointContainer {
			var width = imageData.width,
				height = imageData.height;

			return PointContainer.fromCanvasPixelArray(imageData.data, width, height);
			/*
			 var buf8;
			 if (Utils.typeOf(imageData.data) == "CanvasPixelArray")
			 buf8 = new Uint8Array(imageData.data);
			 else
			 buf8 = imageData.data;

			 this.fromUint32Array(new Uint32Array(buf8.buffer), width, height);
			 */
		}

		static fromArray(byteArray : number[], width : number, height : number) : PointContainer {
			var uint8array = new Uint8Array(byteArray);
			return PointContainer.fromUint8Array(uint8array, width, height);
		}

		static fromCanvasPixelArray(data : any, width : number, height : number) : PointContainer {
			return PointContainer.fromArray(data, width, height);
		}

        static fromUint8Array(uint8array : Uint8Array, width : number, height : number) : PointContainer {
            return PointContainer.fromUint32Array(new Uint32Array(uint8array.buffer), width, height);
        }

		static fromNodeBuffer(buffer : NodeBuffer, width : number, height : number) : PointContainer {
            var uint8array = new Uint8Array(buffer.length);
			for(var i = 0; i < buffer.length; i++) {
				uint8array[i] = buffer[i];
			}
			return PointContainer.fromUint32Array(new Uint32Array(uint8array.buffer), width, height);
        }

        static fromUint32Array(uint32array : Uint32Array, width : number, height : number) : PointContainer {
			var container = new PointContainer(width, height);

			container._pointArray = [];//new Array(uint32array.length);
			for(var i = 0, l = uint32array.length; i < l; i++) {
				container._pointArray[i] = Point.createByUint32(uint32array[i] | 0); // "| 0" is added for v8 optimization
			}

			return container;
		}
	}

}
