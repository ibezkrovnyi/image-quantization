///<reference path="clickToCompare.ts"/>
///<reference path="originalVsQuantized.ts"/>
///<reference path="../../controller/ui.ts"/>
module UI {
	export var rightPanel = {
		view   : "tabview", gravity : 3,
		tabbar : {
			optionWidth : 200, value : "clickToCompare", options : [
				{value : 'Click-to-Compare', id : 'clickToCompare'},
				{value : 'Original-vs-Quantized', id : 'originalVsQuantized'}
			],
			on          : {
				onAfterTabClick : (id) => {
					Controller.update(false);
				}
			}
		},
		cells  : [
			quantizedImageClickToCompare,
			quantizedImageOriginalVsQuantized,
		]
	};
}
