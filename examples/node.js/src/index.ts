import * as iq from 'image-q';

var p1 = iq.utils.Point.createByRGBA(0, 0, 0, 0),
  p2 = iq.utils.Point.createByRGBA(255, 255, 255, 0);

console.log(new iq.distance.CIEDE2000().calculateNormalized(p1, p2));

var width = 16,
  height = 16,
  imageArray: number[] = [],
  distance = new iq.distance.CIEDE2000();

for (var i = 0; i < width * height * 4; i++) {
  imageArray[i] = (Math.random() * 256) | 0;
}

function timeMark(title: string, callback: () => void) {
  var start = Date.now();
  callback();
  console.log(title + ': ' + (Date.now() - start));
}

timeMark('!!! total time', () => {
  for (var i = 0; i < 30; i++) {
    // simulate image loading
    var pointContainer = iq.utils.PointContainer.fromUint8Array(
        imageArray,
        width,
        height,
      ),
      iqPalette,
      iqImage,
      palette: iq.utils.Palette;

    // quantize palette
    timeMark('palette: neuquant', function () {
      iqPalette = new iq.palette.NeuQuant(distance, 256);
      iqPalette.sample(pointContainer);
      palette = iqPalette.quantizeSync();
    });

    timeMark('palette: rgbquant', function () {
      iqPalette = new iq.palette.RGBQuant(distance, 256);
      iqPalette.sample(pointContainer);
      palette = iqPalette.quantizeSync();
    });

    timeMark('palette: wuquant', function () {
      iqPalette = new iq.palette.WuQuant(distance, 256);
      iqPalette.sample(pointContainer);
      palette = iqPalette.quantizeSync();
    });

    // quantize image
    timeMark('image: error diffusion: sierra lite', function () {
      iqImage = new iq.image.ErrorDiffusionArray(
        distance,
        iq.image.ErrorDiffusionArrayKernel.SierraLite,
      );
      iqImage.quantizeSync(pointContainer, palette);
    });
  }
});

/*
 function method1(a, b, c, d) {
 return a * a + b*b + c*c + d*d;
 }
 function method2(a, b, c, d) {
 return Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2) + Math.pow(d, 2);
 }
 function doLoops(callback) {
 var sum = 0;
 for(var i = 0; i < 10000000; i++) {
 sum += callback(i, i+5, Math.random()|0, 17);
 }
 }
 timeMark("method1", function() {
 doLoops(method1);
 });

 timeMark("method2", function() {
 doLoops(method2);
 });

 timeMark("method1", function() {
 doLoops(method1);
 });

 timeMark("method2", function() {
 doLoops(method2);
 });

 timeMark("method1", function() {
 doLoops(method1);
 });

 timeMark("method2", function() {
 doLoops(method2);
 });
 */
