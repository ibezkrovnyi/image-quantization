/**
 * @preserve
 * Copyright 2015-2016 Igor Bezkrovnyi
 * All rights reserved. (MIT Licensed)
 *
 * iq.ts - Image Quantization Library
 */
import { IDistanceCalculator } from "./common"
import { CIE94 } from "./cie94"
import { CIEDE2000 } from "./ciede2000"
import { CMETRIC } from "./cmetric"
import { Euclidean } from "./euclidean"
import { EuclideanRgbQuantWithAlpha } from "./euclideanRgbQuantWithAlpha"
import { EuclideanRgbQuantWOAlpha } from "./euclideanRgbQuantWOAlpha"
import { Manhattan } from "./manhattan"
import { ManhattanSRGB } from "./manhattanSRGB"
import { ManhattanNommyde } from "./manhattanNommyde"
import { PNGQUANT } from "./pngQuant"

export {
	IDistanceCalculator,
	CIE94,
	CIEDE2000,
	CMETRIC,
	Euclidean,
	EuclideanRgbQuantWithAlpha,
	EuclideanRgbQuantWOAlpha,
	Manhattan,
	ManhattanSRGB,
	ManhattanNommyde,
	PNGQUANT
}
