IQ.ts
-----
Image Quantization Library in **TypeScript** _(MIT Licensed)_
![quantization](https://raw.githubusercontent.com/leeoniya/RgbQuant.js/master/quantization.png "quantization")

Introduction
------------
This color quantization library was created because I was unable to find high-grade image quantization library with alpha support in TypeScript on the internet.
 
[API](http://igor-bezkrovny.github.io/image-quantization/doc)  
[Online Demo](http://igor-bezkrovny.github.io/image-quantization-demo)  
[Demo Source](https://github.com/igor-bezkrovny/igor-bezkrovny.github.io/image-quantization-demo)

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
var distanceCalculator = new IQ.Distance.DistanceEuclidean();

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
var imageDitherer = new IQ.Image.NearestColor(distanceCalculator);

// take generated image using given palette 
var resultPointContainer = imageQuantizer.quantize(pointContainer, palette);
```

You may work with resultPointContainer directly or you may convert it to `Uint8Array`/`Uint32Array`
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
Image Quantization Library supports: 

1. Euclidean Distance
2. Manhattan Distance
3. CIE94 Distance
   - [Source Code (Iulius Curt)](https://github.com/iuliux/CIE94.js)
4. CIEDE2000
   - [Math and Test Data Table (PDF)](http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf) 
   - [Source Code (Greg Fiumara)](https://github.com/gfiumara/CIEDE2000) `C` 
5. Euclidean Distance w/o Alpha (RgbQuant)
6. Euclidean Distance w/o sRGB coefficients (Xiaolin Wu Quant)  
7. Manhattan Distance w/o sRGB coefficients (NeuQuant)
8. [CMETRIC](http://www.compuphase.com/cmetric.htm) `DRAFT!`

Color conversion formulas
-------------------------
1. [Pseudo-code](http://www.easyrgb.com/?X=MATH)

> Be sure to fix rgb2xyz/xyz2lab. Issue is with strange part of code: `r = r > 0.04045 ? ...`. Check http://en.wikipedia.org/wiki/Lab_color_space   

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

TODO
----
1. notification about progress
2. riemersma dithering

Changelog
---------

##### 0.1.1 (2015-06-16)
+ Auto-generated documentation added
+ Refactoring 

##### 0.1.0 (2015-06-16)
+ Code cleanup, removed unnecessary files

##### 0.0.5 (2015-06-16)
+ PNGQUANT color distance added, need to check its quality
+ CIEDE2000 and CIE94 fixed for use in NeuQuant
+ NeuQuant is fixed according to original Anthony Dekker source code (all values should be integer) 
+ Code refactoring and cleanup
* We have some slowdown because of red/green/blue/alpha normalization according to white point per each calculateRaw/calculateNormalized call 

##### 0.0.4 (2015-06-15)
+ CIEDE2000 color distance equation optimized (original CIEDE2000 equation is available as class `CIEDE2000_Original`) 

##### 0.0.3b (2015-06-11)
+ CMETRIC color distance fixed

##### 0.0.3a (2015-06-11)
+ Cleanup
+ Draft of CMETRIC color distance added

##### 0.0.2 (2015-06-10)
+ rgb2xyz & xyz2lab fixed. CIEDE2000 works much better now.
+ CIE94 distance formula added. More investigation is needed.

##### 0.0.1
+ Initial

License
-------
License MIT [(NeuQuant use also forces to add it's copyright notice into source code)](./src/paletteQuantizers/neuquant/neuquant.ts)
  
Credits
-------
Thanks to Leon Sorokin for information share and his original RgbQuant!

