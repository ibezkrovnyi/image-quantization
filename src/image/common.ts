module IQ.Image {
	export interface IImageDitherer {
		quantize(pointBuffer : Utils.PointContainer, palette : Utils.Palette) : Utils.PointContainer;
	}
}
