/// <reference path="typings/mocha-node.d.ts" />
/// <reference path="typings/chai.d.ts" />
/// <reference path="../src/iq.ts" />

var expect = require('chai').expect;

function testPalette(folder : string, klass : IQ.Palette.IPaletteQuantizer) : void {

}

describe('image-quantization', function(){
  describe('palette', function(){

    this.testPalette('neuquant (integer)', IQ.Palette.NeuQuant);
    testPalette('rgbquant (integer)', IQ.Palette.RgbQuant);
    testPalette('neuquant (float)', IQ.Palette.NeuQuantFloat);
    testPalette('wuquant (integer)', IQ.Palette.WuQuant);
/*
    it('should return -1 when the value is not present', function() {
      expect(this.chunks).to.contain.keys('IDAT', 'IHDR', 'IEND');
    })
*/
  });
});
