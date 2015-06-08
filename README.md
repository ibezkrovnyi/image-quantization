IQ.ts
-----
Image Quantization Library in **TypeScript** _(MIT Licensed)_
![quantization](https://raw.githubusercontent.com/leeoniya/RgbQuant.js/master/quantization.png "quantization")

Introduction
------------
This color quantization library was created because I was unable to find high-grade image quantization library with alpha support in TypeScript on the internet.
 
[Online Demo](http://igor-bezkrovny.github.io/ImageQuantization)  
[Demo Source](https://github.com/igor-bezkrovny/igor-bezkrovny.github.io)

Usage
-----

All usage is shown in JavaScript, it will be mostly the same for TypeScript. `img` should be valid already-loaded image.

##### Load Image (simple example)
```javascript
var img = document.createElement("img");
img.onload = function() {
	// image is loaded, here should be all code utilizing image
	...
}
img.src = "http://pixabay.com/static/uploads/photo/2012/04/11/11/32/letter-a-27580_640.png"
```

##### Generate Palette   
```javascript
// desired colors count
var targetColors = 256;
   
// create pointContainer and fill it with image
var pointContainer = IQ.Utils.PointContainer.fromHTMLImageElement(img);

// create chosen distance calculator (see classes implementing `IQ.IDistanceCalculator`)
var distanceCalculator = new IQ.Color.DistanceEuclidean();

// create chosen palette quantizer (see classes implementing `IQ.IPaletteQuantizer`) 
var paletteQuantizer = new IQ.Palette.RgbQuant(distanceCalculator, targetColors);
		
// feed out pointContainer filled with image to paletteQuantizer
paletteQuantizer.sample(pointContainer);

... (you may sample more than one image to create mutual palette) 

// take generated palette
var palette = paletteQuantizer.quantize();
```

##### Apply Palette to Image (Image Dithering) 
```javascript
// create image ditherer (see classes implementing `IQ.IImageDitherer`)
var imageDitherer = new IQ.Image.NearestNeighbour(distanceCalculator);

// take generated image using given palette 
var resultPointContainer = imageQuantizer.quantize(pointContainer, palette);
```

You may work with resultPointContainer directly or you may want to convert it to `Uint8Array`/`Uint32Array`
```javascript
var uint8array = resultPointContainer.toUint8Array();
```

Palette Quantization Algorithms
-------------------------------

Image Quantization Library is based **RgbQuant** by Leon Sorokin and **NeuQuant** by Tim Oxley (see below).

1. [RgbQuant (Leon Sorokin)](https://github.com/leeoniya/RgbQuant.js) `JavaScript`
2. [NeuQuant (Johan Nordberg)](https://github.com/jnordberg/gif.js/blob/master/src/TypedNeuQuant.js) `TypeScript`
3. [NeuQuant (Tim Oxley)](https://github.com/timoxley/neuquant) `JavaScript`
4. [NeuQuant (Devon Govett)](https://github.com/devongovett/neuquant) `JavaScript`
5. [NeuQuant32 (Stuart Coyle)](https://github.com/stuart/pngnq/blob/master/src/neuquant32.c) `C`
6. [Xiaolin Wu (Xiaolin Wu)](http://www.ece.mcmaster.ca/~xwu/cq.c) `C` 
7. [Xiaolin Wu (Smart-K8)](http://www.codeproject.com/Articles/66341/A-Simple-Yet-Quite-Powerful-Palette-Quantizer-in-C) `C#`
8. Xiaolin Wu w/ Alpha (Matt Wrock) [How to add Alpha](https://code.msdn.microsoft.com/windowsdesktop/Convert-32-bit-PNGs-to-81ef8c81/view/SourceCode#content), [Source Code](https://nquant.codeplex.com) `C#`
9. [MedianCut (mwcz)](https://github.com/mwcz/median-cut-js) `GPLv3`
> all NeuQuant implementations above are based on Anthony Dekker's implementation and thus needs to save his original copyright notice in the source code

Image Quantization Algorithms
-----------------------------
Image Quantization Library supports **Error Diffusion dithering** and **Nearest Neighbour** methods. 

1. [All (ImageMagik doc)](http://www.imagemagick.org/Usage/quantize/#dither)
2. [Error Diffusion dithering (Tanner Helland)](http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code)
3. [Riemersma dithering](http://www.compuphase.com/riemer.htm) `TODO: Check License`
4. [Ordered dithering (Joel Yliluoma)](http://bisqwit.iki.fi/story/howto/dither/jy)

Color Distance Formulas
-----------------------
Image Quantization Library supports **Euclidean distance** for RgbQuant and **Manhattan distance ??** for NeuQuant. `TODO: Check NeuQuant distance formula` 

1. [CIE94 (Iulius Curt)](https://github.com/iuliux/CIE94.js)
2. [CIEDE2000 Markus Ekholm](https://github.com/markusn/color-diff) `3-clause BSD`
3. Euclidean distance
4. Manhattan distance ? TBD

Color conversion formulas
-------------------------

1. [Pseudo-code](http://www.easyrgb.com/?X=MATH) 

Image Quality Assessment
------------------------

1. [SSIM info](http://en.wikipedia.org/wiki/Structural_similarity)
2. [SSIM (Rhys-e)](https://github.com/rhys-e/structural-similarity) `Java` `License: MIT`
3. PSNR ? TBD
4. MSE ? TBD

Other
-----

1. [HUSL (Boronine) - info](http://www.husl-colors.org)
2. [HUSL (Boronine) - code](https://github.com/husl-colors/husl)

License
-------
License MIT [(NeuQuant use also forces to add it's copyright notice into source code)](./src/paletteQuantizers/neuquant/neuquant.ts)
  
Credits
-------
Thanks to Leon Sorokin for information share and his original RgbQuant!

