/// <reference path='common.ts' />
module IQ.Image {

	export class NearestNeighbour implements IImageDitherer {
		private _distance : Color.IDistanceCalculator;

		constructor(colorDistanceCalculator : Color.IDistanceCalculator) {
			this._distance = colorDistanceCalculator;
		}

		public quantize(pointBuffer : Utils.PointContainer, palette : Utils.Palette) : Utils.PointContainer {
			var pointArray = pointBuffer.getPointArray(),
				width = pointBuffer.getWidth(),
				height = pointBuffer.getHeight();

			for (var y = 0; y < height; y++) {
				for (var x = 0, idx = y * width; x < width; x++, idx++) {
					// Image pixel
					var point = pointArray[ idx ];
					// Reduced pixel
					point.from(palette.getNearestColor(this._distance, point));
				}
			}
			return pointBuffer;
		}
	}

}
