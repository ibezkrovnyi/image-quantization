module IQ.Color.Constants.sRGB {
	// sRGB (based on ITU-R Recommendation BT.709)
	// http://en.wikipedia.org/wiki/SRGB
	// luma coef
	export enum Y {
		RED = .2126, GREEN = .7152, BLUE = .0722, WHITE = 1
	}

	export enum x {
		RED = .6400, GREEN = .3000, BLUE = .1500, WHITE = .3127
	}

	export enum y {
		RED = .3300, GREEN = .6000, BLUE = .0600, WHITE = .3290
	}
}
