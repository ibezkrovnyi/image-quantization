///<reference path="../lib/webix/webix.d.ts"/>
///<reference path="../../../src/iq.ts"/>
///<reference path="controller/usage.ts"/>
///<reference path="data/imageList.ts"/>
///<reference path="ui\leftPanel\leftPanel.ts"/>
///<reference path="ui\rightPanel\rightPanel.ts"/>
webix.ready(function () {

	webix.ui({
		type : "line",
		cols : [
			{
				width : 570,
				header : "Settings & Folders", headerHeight : 45,
				body : UI.leftPanel
			},
			{view : "resizer"},
			UI.rightPanel
		]
	});

	Controller.initialize();

});
