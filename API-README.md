Image Color Number Reduction with alpha support using RGBQuant/NeuQuant/Xiaolin Wu's algorithms and Euclidean/Manhattan/CIEDE2000 color distance formulas in TypeScript

# Table of Contents
* [Basic API](#basic-api)
  + [Tutorial](#basic-api-tutorial)
  + [Build Palette](#build-palette)
  + [Apply Palette to Image](#apply-palette-to-image)
  + [Optional parameters](#optional-parameters)
* [Advanced API](#advanced-api)
  + [Image Import Sources](#image-import-sources)
  + [Color Distance](#color-distance)
  + [Palette Quantizers](#palette-quantizers)
  + [Image Quantizers](#image-quantizers)
  + [Output](#output)
* [Misc API](#misc-api)
  + [Color Conversion](#color-conversion)
  + [Structural Similarity](#structural-similarity)

# Basic API

## Basic API Tutorial

### Convert 24 bit PNG to indexed 8 bit

```ts
import { PNG } from 'pngjs';
import { buildPaletteSync, utils } from 'image-q';

// read file
const { data, width, height } = PNG.sync.read(fs.readFileSync('file.png'));
const inPointContainer = utils.PointContainer.fromUint8Array(data, width, height);

// convert
const palette = buildPaletteSync([inPointContainer]);
const outPointContainer = applyPaletteSync(inPointContainer, palette);

// use outPointContainer.toUint8Array() somehow
```

## Build Palette
This API allows to Build (quantize) palette using Sample Images, returns [[Palette]] instance.

### Async
```ts
import { buildPalette } from 'image-q'; // or const buildPalette = require('image-q').buildPalette
const palette = await buildPalette([pointContainer], { 
  colorDistanceFormula: 'euclidean', // optional
  paletteQuantization: 'neuquant', // optional
  colors: 128, // optional
  onProgress: progress => console.log('applyPalette', progress), // optional
});
```

### Sync
```ts
import { buildPaletteSync } from 'image-q'; // or const buildPaletteSync = require('image-q').buildPaletteSync
const palette = buildPaletteSync([pointContainer], { 
  colorDistanceFormula: 'euclidean', // optional
  paletteQuantization: 'neuquant', // optional
  colors: 128, // optional
});
```
> implementation detail: generator is wrapped with setImmediate (polyfilled)

## Apply Palette to Image
This API applies given [[Palette]] to the [[PointContainer]], returns [[PointContainer]] containing new image.

### Async (Promise-based)
```ts
import { applyPalette } from 'image-q'; // or const applyPalette = require('image-q').applyPalette
const outPointContainer = await applyPalette(pointContainer, palette, {
  colorDistanceFormula: 'euclidean', // optional
  imageQuantization: 'floyd-steinberg', // optional
  onProgress: progress => console.log('applyPalette', progress), // optional
});
```

### Sync
```ts
import { applyPaletteSync } from 'image-q'; // or const applyPaletteSync = require('image-q').applyPaletteSync
const outPointContainer = applyPaletteSync(pointContainer, palette, {
  colorDistanceFormula: 'euclidean', // optional
  imageQuantization: 'floyd-steinberg', // optional
});
```

## Optional parameters
See description of string constants in [Advanced API](#advanced-api) Section

```ts
export type ColorDistanceFormula =
  | 'cie94-textiles'
  | 'cie94-graphic-arts'
  | 'ciede2000'
  | 'color-metric'
  | 'euclidean'
  | 'euclidean-bt709-noalpha'
  | 'euclidean-bt709'
  | 'manhattan'
  | 'manhattan-bt709'
  | 'manhattan-nommyde'
  | 'pngquant';
```

```ts
export type PaletteQuantization =
  | 'neuquant'
  | 'neuquant-float'
  | 'rgbquant'
  | 'wuquant';
```

```ts
export type ImageQuantization =
  | 'nearest'
  | 'riemersma'
  | 'floyd-steinberg'
  | 'false-floyd-steinberg'
  | 'stucki'
  | 'atkinson'
  | 'jarvis'
  | 'burkes'
  | 'sierra'
  | 'two-sierra'
  | 'sierra-lite';
```

## Apply Palette to Image

# Advanced API

## Image Import Sources

| API | Source ||
|:-----------------------------------------| ----------------------------------------------------------------------------------- |:------------------------|
| **_Canvas related_**                     |                                                                                     |                         |
| [[PointContainer.fromHTMLCanvasElement]] | [HTMLCanvasElement](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement)   |                         |
| [[PointContainer.fromImageData]]         | [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)             | ctx.getImageData()      |
| [[PointContainer.fromUint8Array]]        | [Uint8ClampedArray](https://developer.mozilla.org/docs/Web/API/ImageData/data)      | ctx.getImageData().data |
| [[PointContainer.fromUint8Array]]        | [deprecated CanvasPixelArray](https://www.w3.org/Bugs/Public/show_bug.cgi?id=12586) | ctx.getImageData().data |
| **_Other_**                              |                                                                                                          ||
| [[PointContainer.fromHTMLImageElement]]  | [HTMLImageElement](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)                          ||
| [[PointContainer.fromImageData]]         | [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)                ||
| [[PointContainer.fromUint8Array]]        | [Uint8Array](https://developer.mozilla.org/pl/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)   ||
| [[PointContainer.fromUint32Array]]       | [Uint32Array](https://developer.mozilla.org/pl/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array) ||
| [[PointContainer.fromBuffer]]            | [Buffer (Node.js)](https://nodejs.org/api/buffer.html)                                                   ||

  Usage:
  ```ts
  const canvas = document.querySelector('#canvas');
  const pointContainer = PointContainer.fromHTMLCanvasElement(canvas);
  ```

## Color Distance

| API                       | Description                                  | Originally used by |
| ------------------------- |:---------------------------------------------|------------ |
| [[Euclidean]]             | 1/1/1/1 coefficients                         | WuQuant     |
| [[EuclideanBT709]]        | BT.709 sRGB coefficients                     |             |
| [[Manhattan]]             | 1/1/1/1 coefficients                         | NeuQuant    |
| [[ManhattanBT709]]        | BT.709 sRGB coefficients                     |             |
| [[CIEDE2000]]             | CIEDE2000 (very slow)                        |             |
| [[CIE94Textiles]]         | CIE94 implementation for textiles            |             | 
| [[CIE94GraphicArts]]      | CIE94 implementation for graphic arts        |             |
| [[CMetric]]               | [see](http://www.compuphase.com/cmetric.htm) |             |
| [[PNGQuant]]              | used in PNGQuant tools                       |             |
| [[EuclideanBT709NoAlpha]] | BT.709 sRGB coefficients                     | RGBQuant    |
| [[ManhattanNommyde]]      | [discussion](https://github.com/igor-bezkrovny/image-quantization/issues/4#issuecomment-234527620) |  |  |

  Usage:
  ```ts
  const distanceCalculator = new EuclideanBT709();
  ```

## Palette Quantizers

| API                       | Description                                  |
| ------------------------- |:---------------------------------------------|
| [[NeuQuant]]              | original code ported, integer calculations   |
| [[RGBQuant]]              |                                              |
| [[WuQuant]]               |                                              |
| [[NeuQuantFloat]]         | floating-point calculations                  |

  Usage (sync):
  ```ts
  const paletteQuantizer = new WuQuant(distanceCalculator, 256);
  paletteQuantizer.sample(pointContainer1);
  paletteQuantizer.sample(pointContainer2);
  const palette = paletteQuantizer.quantizeSync();
  ```

  Usage (generator):
  ```ts
  // example 1
  const paletteQuantizer = new WuQuant(distanceCalculator, 256);
  paletteQuantizer.sample(pointContainer1);
  paletteQuantizer.sample(pointContainer2);
  const generator = paletteQuantizer.quantize();
  let palette;
  while(true) {
    // calling to generator.next() may be easily wrapped with setTimeout to make it async
    const result = generator.next();
    if (result.done) break;
    if (result.value.palette) palette = result.palette;
    console.log(`${result.value.progress}% done`);
  }
  // example 2
  const paletteQuantizer = new WuQuant(distanceCalculator, 256);
  paletteQuantizer.sample(pointContainer1);
  paletteQuantizer.sample(pointContainer2);
  const palette = Array.from(paletteQuantizer.quantize()).pop().palette;
  ```

## Image Quantizers

| API                          | Description                                                     |
| ---------------------------- |:----------------------------------------------------------------|
| [[NearestColor]]             |                                                                 |
| [[ErrorDiffusionArray]]      | 2 modes of error propagation are supported: `xnview` and `gimp` |
| - 1. [[FloydSteinberg]]      |                                                                 |
| - 2. [[FalseFloydSteinberg]] |                                                                 |
| - 3. [[Stucki]]              |                                                                 |
| - 4. [[Atkinson]]            |                                                                 |
| - 5. [[Jarvis]]              |                                                                 |
| - 6. [[Burkes]]              |                                                                 |
| - 7. [[Sierra]]              |                                                                 |
| - 8. [[TwoSierra]]           |                                                                 |
| - 9. [[SierraLite]]          |                                                                 |
| [[ErrorDiffusionRiemersma]]  | Hilbert space-filling curve is used                             |

  Usage (sync):
  ```ts
  const imageQuantizer = new ErrorDiffusionArray(distanceCalculator, ErrorDiffusionArrayKernel.Jarvis);
  const outPointContainer = imageQuantizer.quantizeSync(inPointContainer, palette);
  ```

  Usage (generator):
  ```ts
  // example 1
  const imageQuantizer = new ErrorDiffusionArray(distanceCalculator, ErrorDiffusionArrayKernel.Jarvis);
  const generator = imageQuantizer.quantize(inPointContainer, palette);
  let outPointContainer;
  while(true) {
    // calling to generator.next() may be easily wrapped with setTimeout to make it async
    const result = generator.next();
    if (result.done) break;
    if (result.value.pointContainer) outPointContainer = result.pointContainer;
    console.log(`${result.value.progress}% done`);
  }
  // example 2
  const imageQuantizer = new ErrorDiffusionArray(distanceCalculator, ErrorDiffusionArrayKernel.Jarvis);
  const outPointContainer = Array.from(imageQuantizer.quantize(inPointContainer, palette)).pop().pointContainer;
  ```


## Output

| API                              | Description                                                                                              |
| -------------------------------- |:---------------------------------------------------------------------------------------------------------|
| [[PointContainer.toUint8Array]]  | [Uint8Array](https://developer.mozilla.org/pl/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)   |
| [[PointContainer.toUint32Array]] | [Uint32Array](https://developer.mozilla.org/pl/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array) |

  Usage:
  ```ts
  // write PNG using pngjs
  png.data = outPointContainer.toUint8Array();
  fs.writeFileSync('filename.png', PNG.sync.write(png))
  ```

# Advanced API Usage

## Load Image (simple example)
```javascript
var img = document.createElement("img");
img.onload = function() {
	// image is loaded, here should be all code utilizing image
	...
}
img.src = "http://pixabay.com/static/uploads/photo/2012/04/11/11/32/letter-a-27580_640.png"
```

## Generate Palette   
```javascript
// desired colors number
var targetColors = 256;
   
// create pointContainer and fill it with image
var pointContainer = iq.utils.PointContainer.fromHTMLImageElement(img);

// create chosen distance calculator (see classes inherited from `iq.distance.AbstractDistanceCalculator`)
var distanceCalculator = new iq.distance.Euclidean();

// create chosen palette quantizer (see classes implementing `iq.palette.AbstractPaletteQuantizer`) 
var paletteQuantizer = new iq.palette.RGBQuant(distanceCalculator, targetColors);
		
// feed out pointContainer filled with image to paletteQuantizer
paletteQuantizer.sample(pointContainer);

... (you may sample more than one image to create mutual palette) 

// take generated palette
var palette = paletteQuantizer.quantizeSync();
```

## Apply Palette to Image (Image Dithering) 
```javascript
// create image quantizer (see classes implementing `iq.image.AbstractImageQuantizer`)
var imageQuantizer = new iq.image.NearestColor(distanceCalculator);

// apply palette to image
var resultPointContainer = imageQuantizer.quantizeSync(pointContainer, palette);
```

You may work with resultPointContainer directly or you may convert it to `Uint8Array`/`Uint32Array`
```javascript
var uint8array = resultPointContainer.toUint8Array();
```

> please also refer to [tests](tests/samples/utils.ts)

# Misc API

## Color Conversion

| API                              | Description                                                                                              |
| -------------------------------- |:---------------------------------------------------------------------------------------------------------|
| [[lab2rgb]]                      | CIE L\*a\*b\* => CIE RGB                                                                                    |
| [[lab2xyz]]                      | CIE L\*a\*b\* => CIE XYZ                                                                                    |
| [[rgb2hsl]]                      | CIE RGB => HSL                                                                                           |
| [[rgb2lab]]                      | CIE RGB => CIE L\*a\*b\*                                                                                    |
| [[rgb2xyz]]                      | CIE RGB => CIE XYZ                                                                                       |
| [[xyz2lab]]                      | CIE XYZ => CIE L\*a\*b\*                                                                                    |
| [[xyz2rgb]]                      | CIE XYZ => CIE RGB                                                                                       |

https://wolfcrow.com/blog/what-is-the-difference-between-cie-lab-cie-rgb-cie-xyy-and-cie-xyz/

## Structural Similarity

* [[ssim]] - https://en.wikipedia.org/wiki/Structural_similarity

  Usage:
  ```ts
  const similarity = ssim(pointContainer1, pointContainer2);
  ```

Have fun! Any problems or queries let me know!

 -- Igor