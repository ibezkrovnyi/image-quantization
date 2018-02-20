/**
 * @preserve
 * Copyright 2015-2018 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * pointContainer.ts - part of Image Quantization Library
 */
import { Point } from './point';

/**
 * v8 optimizations done.
 * fromXXX methods are static to move out polymorphic code from class instance itself.
 */
export class PointContainer {
  private readonly _pointArray: Point[];
  private _width: number;
  private _height: number;

  constructor() {
    this._width = 0;
    this._height = 0;
    this._pointArray = [];
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  setWidth(width: number) {
    this._width = width;
  }

  setHeight(height: number) {
    this._height = height;
  }

  getPointArray() {
    return this._pointArray;
  }

  clone() {
    const clone = new PointContainer();
    clone._width = this._width;
    clone._height = this._height;

    for (let i = 0, l = this._pointArray.length; i < l; i++) {
      clone._pointArray[ i ] = Point.createByUint32(this._pointArray[ i ].uint32 | 0); // "| 0" is added for v8 optimization
    }

    return clone;
  }

  toUint32Array() {
    const l = this._pointArray.length;
    const uint32Array = new Uint32Array(l);

    for (let i = 0; i < l; i++) {
      uint32Array[ i ] = this._pointArray[ i ].uint32;
    }

    return uint32Array;
  }

  toUint8Array() {
    return new Uint8Array(this.toUint32Array().buffer);
  }

  static fromHTMLImageElement(img: HTMLImageElement) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);

    return PointContainer.fromHTMLCanvasElement(canvas);
  }

  static fromHTMLCanvasElement(canvas: HTMLCanvasElement) {
    const width = canvas.width;
    const height = canvas.height;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const imgData = ctx.getImageData(0, 0, width, height);

    return PointContainer.fromImageData(imgData);
  }

  static fromNodeCanvas(canvas: any) {
    return PointContainer.fromHTMLCanvasElement(canvas);
  }

  static fromImageData(imageData: ImageData) {
    const width = imageData.width;
    const height = imageData.height;

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

  static fromArray(byteArray: number[], width: number, height: number) {
    const uint8array = new Uint8Array(byteArray);
    return PointContainer.fromUint8Array(uint8array, width, height);
  }

  static fromCanvasPixelArray(data: any, width: number, height: number) {
    return PointContainer.fromArray(data, width, height);
  }

  static fromUint8Array(uint8array: Uint8Array, width: number, height: number) {
    return PointContainer.fromUint32Array(new Uint32Array(uint8array.buffer), width, height);
  }

  static fromUint32Array(uint32array: Uint32Array, width: number, height: number) {
    const container = new PointContainer();

    container._width = width;
    container._height = height;

    for (let i = 0, l = uint32array.length; i < l; i++) {
      container._pointArray[ i ] = Point.createByUint32(uint32array[ i ] | 0); // "| 0" is added for v8 optimization
    }

    return container;
  }
}
