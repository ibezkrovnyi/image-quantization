///<reference path="configForm.ts"/>
///<reference path="imageFileExplorer.ts"/>
module UI {
	export var leftPanel = {
		type : "line",
		rows : [
			UI.configForm,
			{type : "header", template : "Image Folder"},
			imageFoldersPanel
		]
	};
}
