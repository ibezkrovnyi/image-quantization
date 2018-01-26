import { conversion } from '../../../dist/cjs/image-q';
import { dataLab2RGB } from './dataLab2RGB';
import { dataRGB2Lab } from './dataRGB2Lab';

const rgb2lab = conversion.rgb2lab;
const lab2rgb = conversion.lab2rgb;

describe('lab2xyz and back', function () {
	dataLab2RGB.forEach(item => {
		test(`Colors: Lab = ${item.Lab.L}, ${item.Lab.a}, ${item.Lab.b}`, () => {
			var xyz = conversion.lab2xyz(item.Lab.L, item.Lab.a, item.Lab.b),
				lab = conversion.xyz2lab(xyz.x, xyz.y, xyz.z);
			expect(deepRound(lab, 4)).toEqual(deepRound(item.Lab, 4));
		});
	});
});

describe('rgb2xyz and back', function () {

	dataRGB2Lab.forEach(item => {
		test(`Colors: rgb = ${item.rgb.r}, ${item.rgb.g}, ${item.rgb.b}`, () => {
			var xyz = conversion.rgb2xyz(item.rgb.r, item.rgb.g, item.rgb.b),
				rgb = conversion.xyz2rgb(xyz.x, xyz.y, xyz.z);
			expect(deepRound(rgb, 4)).toEqual(deepRound(item.rgb, 4));
		});
	});
});

describe('xyz2lab and back', function () {

	dataLab2RGB.forEach(item => {
		const xyz = conversion.lab2xyz(item.Lab.L, item.Lab.a, item.Lab.b);
		test(`Colors: xyz = ${xyz.x}, ${xyz.y}, ${xyz.z}`, () => {
			var lab    = conversion.xyz2lab(xyz.x, xyz.y, xyz.z),
				newXyz = conversion.lab2xyz(lab.L, lab.a, lab.b);
			expect(deepRound(newXyz, 4)).toEqual(deepRound(xyz, 4));
		});
	});
});

describe('xyz2rgb and back', function () {

	dataRGB2Lab.forEach(item => {
		const xyz = conversion.rgb2xyz(item.rgb.r, item.rgb.g, item.rgb.b);
		test(`Colors: xyz = ${xyz.x}, ${xyz.y}, ${xyz.z}`, () => {
			var rgb    = conversion.xyz2rgb(xyz.x, xyz.y, xyz.z),
				newXyz = conversion.rgb2xyz(rgb.r, rgb.g, rgb.b);
			expect(deepRound(newXyz, 4)).toEqual(deepRound(xyz, 4));
		});
	});
});

describe('rgb2lab', function () {

	dataRGB2Lab.forEach(item => {
		const Lab = item.Lab,
			  rgb = item.rgb;

		test(`Colors: Lab = ${Lab.L}, ${Lab.a}, ${Lab.b}, rgb = ${rgb.r}, ${rgb.g}, ${rgb.b}`, () => {
			var labCalculated = rgb2lab(rgb.r, rgb.g, rgb.b);
			expect(deepRound(labCalculated, 4)).toEqual(deepRound(Lab, 4));
		});
	});
});

describe('lab2rgb', function () {

	dataLab2RGB.forEach(item => {
		const Lab = item.Lab,
			  rgb = item.rgb;
		test(`Colors: Lab = ${Lab.L}, ${Lab.a}, ${Lab.b}, rgb = ${rgb.r}, ${rgb.g}, ${rgb.b}`, () => {
			var rgbCalculated = lab2rgb(Lab.L, Lab.a, Lab.b);
			expect(deepRound(rgbCalculated, 4)).toEqual(deepRound(rgb, 4));
		});
	});
});

function deepRound (obj, digitsAfterPoint) {
	Object.keys(obj).forEach(propertyName => {
		var n          = obj[propertyName],
			multiplier = Math.pow(10, digitsAfterPoint);
		obj[propertyName] = Math.round(n * multiplier) / multiplier;
	})
}

function roundLike (n, likeThisValue) {
	var s             = likeThisValue.toString(),
		pointPosition = s.indexOf('.');

	if (pointPosition < 0) {
		return Math.round(n);
	}

	var digitsAfterPoint = s.length - pointPosition - 1,
		multiplier       = Math.pow(10, digitsAfterPoint);
	return Math.round(n * multiplier) / multiplier;
}

