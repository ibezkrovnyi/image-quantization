Image Color Number Reduction with alpha support using RGBQuant/NeuQuant/Xiaolin Wu's algorithms and Euclidean/Manhattan/CIEDE2000 color distance formulas in TypeScript

# Table of Contents
* [Tutorial](#usage)
* [API Documentation Overview](#api-documentation-overview)

# API Documentation Overview

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

  Usage:
  ```ts
  const paletteQuantizer = new WuQuant(distanceCalculator, 256);
  paletteQuantizer.sample(pointContainer1);
  paletteQuantizer.sample(pointContainer2);
  const palette = paletteQuantizer.quantize();
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

  Usage:
  ```ts
  const imageQuantizer = new ErrorDiffusionArray(distanceCalculator, Jarvis);
  const outPointContainer = imageQuantizer.quantize(inPointContainer, palette);
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

# Advanced API

## Color Conversion

| API                              | Description                                                                                              |
| -------------------------------- |:---------------------------------------------------------------------------------------------------------|
| [[lab2rgb]]                      | CIE L*a*b* => CIE RGB                                                                                    |
| [[lab2xyz]]                      | CIE L*a*b* => CIE XYZ                                                                                    |
| [[rgb2hsl]]                      | CIE RGB => HSL                                                                                           |
| [[rgb2lab]]                      | CIE RGB => CIE L*a*b*                                                                                    |
| [[rgb2xyz]]                      | CIE RGB => CIE XYZ                                                                                       |
| [[xyz2lab]]                      | CIE XYZ => CIE L*a*b*                                                                                    |
| [[xyz2rgb]]                      | CIE XYZ => CIE RGB                                                                                       |

https://wolfcrow.com/blog/what-is-the-difference-between-cie-lab-cie-rgb-cie-xyy-and-cie-xyz/

Have fun! Any problems or queries let me know!

 -- Igor