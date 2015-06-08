module IQ {
	export interface IPaletteQuantizer {
		sample(pointBuffer : Utils.PointContainer) : void;
		quantize() : Utils.Palette;
	}
}
