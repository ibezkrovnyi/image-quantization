///<reference path="../lib/webix/webix.d.ts"/>
///<reference path="../../../src/iq.ts"/>
///<reference path="usage.ts"/>
webix.ready(function () {

	var imageFoldersData = [
		{
			id : "root", value : "Alpha", open : true, data : [
			{id : "1.1", folder : "alpha", file : "children-745674_1920.png"},
			{id : "1.2", folder : "alpha", file : "alpha.png"},
			{id : "1.3", folder : "alpha", file : "AlphaBall.png"},
			{id : "1.4", folder : "alpha", file : "AlphaEdge.png"},
			{id : "1.5", folder : "alpha", file : "alphatest.png"},
			{id : "1.6", folder : "alpha", file : "cherries-realistic.png"},
			{id : "1.7", folder : "alpha", file : "dice-trans.png"},
			{id : "1.8", folder : "alpha", file : "pnggrad16rgba.png"},
			{id : "1.8", folder : "alpha", file : "tumblr_moyw62RyQo1s5jjtzo1_500.png"},
			{id : "1.8", folder : "alpha", file : "Wilber-huge-alpha.png"}
		]
		},
		{
			id : "2", open : true, value : "The Godfather", data : [
			{id : "2.1", value : "Part 1"},
			{id : "2.2", value : "Part 2"}
		]
		}

	];

	var imageFoldersData1 = [
		{
			"id" : 1,
			"title" : "Alpha",
			"folder" : "alpha"
		},
		{
			"id" : 2,
			"title" : "Gradients",
			"folder" : "gradients"
		},
		{
			"id" : 3,
			"title" : "Graphics",
			"folder" : "graphics"
		},
		{
			"id" : 4,
			"title" : "Photo 1",
			"folder" : "photo1"
		},
		{
			"id" : 5,
			"title" : "Photo 2",
			"folder" : "photo2"
		}
	];

	var configForm = {
		view : "form", id : "myform", width : 300, elements : [
			{
				view : "richselect",
				id : "option-colors",
				label : "Colors",
				labelWidth : 175,
				value : "256",
				options : [
					"2",
					"4",
					"16",
					"64",
					"128",
					"256",
					"512",
					"1024",
					"2048",
					"8192"
				]
			},
			{
				view : "richselect",
				id : "option-distance",
				label : "Color Distance Equation",
				labelWidth : 175,
				value : "6",
				options : [
					{id : 1, value : "Euclidean"},
					{id : 2, value : "Manhattan"},
					{id : 3, value : "CIEDE2000"},
					{id : 4, value : "CIE94"},
					{id : 5, value : "RgbQuant Euclidean (w/o ALPHA)"},
					{id : 6, value : "NeuQuant Manhattan (w/o sRGB coef)"},
					{id : 7, value : "WuQuant Euclidean (w/o sRGB coef)"},
					{id : 8, value : "CMETRIC"}
				]
			},
			{
				view : "richselect",
				id : "option-palette",
				label : "Quantization Method",
				labelWidth : 175,
				value : "1",
				options : [
					{id : 1, value : "neuquant"},
					{id : 2, value : "rgbquant"},
					{id : 3, value : "wuquant"}
				]
			},
			{
				view : "richselect",
				id : "option-image",
				label : "Palette-to-Image Method",
				labelWidth : 175,
				value : "1",
				options : [
					{id : 1, value : "Nearest (Simple)"},
					{id : 2, value : "ErrorDiffusion: Floyd-Steinberg"},
					{id : 4, value : "ErrorDiffusion: Stucki"},
					{id : 5, value : "ErrorDiffusion: Atkinson"},
					{id : 6, value : "ErrorDiffusion: Jarvis"},
					{id : 7, value : "ErrorDiffusion: Burkes"},
					{id : 8, value : "ErrorDiffusion: Sierra"},
					{id : 9, value : "ErrorDiffusion: TwoSierra"},
					{id : 10, value : "ErrorDiffusion: SierraLite"},
					{id : 3, value : "ErrorDiffusion: False Floyd-Steinberg"}
				]
			},
			{
				type : "line",
				view : "toolbar",
				elements : [{}, {view : "button", value : "Update", width : 90, on : {onItemClick : update}}]
			}

		]
	};

	var imageFoldersPanel = {
		id : "image",
		view : "grouplist",
		type : {
			height : 84
		},
		//autoheight : true,
		height : 800,
		template : function (obj : any) {
			if (obj.folder && obj.file) {
				return "<img style=\"height: 84px\" src=\"images/" + obj.folder + "/" + obj.file + "\"/>"
			} else {
				return "<div style=\"line-height: 84px\">" + obj.value + "</div>";
			}
		},
		select : true,
		//scroll : false,
		data : imageFoldersData,
		on : {
			"onafterselect" : (id) => {
				update();
			}
		},
		ready : function () {  //select USA
			//this.select(0);
		}

		/*
		 select:true,
		 on:{ "onafterselect":country_selected },
		 type:{ height: 84 },
		 ready:function(){  //select USA
		 this.select(6);
		 }
		 */
	};

	var leftPanel = {
		type : "line",
		rows : [
			configForm,
			{type : "header", template : "Image Folder"},
			imageFoldersPanel
		]
	};

	var quantizedImageClickToCompare = {
		id : "clickToCompare",
		rows : [
			{
				id : "imageView1-statistics",
				view : "template",
				height : 30
			},

			{
				cols : [
					{
						rows : [
							{
								type : "header",
								template : "Palette"
							},
							{
								id : "imageView1-palette",
								width : 140,
								view : "template"
							}
						]
					},
					{
						rows : [
							{
								type : "header",
								template : "Image"
							},
							{
								id : "imageView1-image",
								view : "template"
							}
						]
					}
				]
			}

		]

		//view : "template"
	};
	var quantizedImageOriginalVsQuantized = {
		id : "originalVsQuantized",
		rows : [
			{
				id : "imageView2-statistics",
				view : "template",
				height : 30
			},
			{
				cols : [
					{
						rows : [
							{
								type : "header",
								template : "Palette"
							},
							{
								id : "imageView2-palette",
								width : 140,
								view : "template"
							}
						]
					},
					{
						rows : [
							{
								type : "header",
								template : "Original Image"
							},
							{
								id : "imageView2-image-original",
								view : "template"
							}
						]
					},
					{
						rows : [
							{
								type : "header",
								template : "Quantized Image"
							},
							{
								id : "imageView2-image-quantized",
								view : "template"
							}
						]
					}
				]
			}
		]
	};

	var rightPanel = {
		view : "tabview", gravity : 3,
		tabbar : {
			optionWidth : 200, value : "clickToCompare", options : [
				{value : 'Click-to-Compare', id : 'clickToCompare'},
				{value : 'Original-vs-Quantized', id : 'originalVsQuantized'}
			]
		},
		cells : [
			quantizedImageClickToCompare,
			quantizedImageOriginalVsQuantized,
		]
	};

	webix.ui({
		type : "line",
		cols : [
			{
				width : 500,
				header : "Settings & Folders", headerHeight : 45,
				body : leftPanel
			}/*leftPanel*/,
			{view : "resizer"},
			rightPanel
		]
	});

	setTimeout(() => {
		update();
	}, 1000);

	function update() {
		var imageFoldersControl = (<webix.ui.grouplist>$$("image"));
		var selectedId = imageFoldersControl.getSelectedId(true);
		if (selectedId.length > 0) {
			var node = imageFoldersControl.getItemNode(selectedId[0]);
			if (node) {
				var img : HTMLImageElement = (<any>node).firstElementChild;

				if (img.tagName === "IMG") {
					var colors = parseInt((<webix.ui.richselect>$$("option-colors")).getValue(), 10),
						paletteQuantizerMethod = parseInt((<webix.ui.richselect>$$("option-palette")).getValue(), 10),
						imageQuantizerMethod = parseInt((<webix.ui.richselect>$$("option-image")).getValue(), 10) - 2,
						colorDistanceMethod = parseInt((<webix.ui.richselect>$$("option-distance")).getValue(), 10);

					var result = Usage.quantize(img, colors, paletteQuantizerMethod, imageQuantizerMethod, colorDistanceMethod);
					fillClickToCompare(result);
					fillOriginalVsQuantized(result);
				}
			}
		}
	}

	function fillOriginalVsQuantized(result) {
		// CLEANUP
		//container.innerHTML = "";
		$$("imageView2-statistics").getNode().firstElementChild.innerHTML = " (SSIM: " + result.ssim.toFixed(2) + ", Time: " + result.time + " )";

		// DRAW ORIGINAL IMAGE
		var canvas = Usage.drawPixels(result.original, result.original.getWidth());
		canvas.id = "original-image";
		//canvas.style.display = "none";
		var container = $$("imageView2-image-original").getNode().firstElementChild;
		container.innerHTML = "";
		container.appendChild(canvas);

		// DRAW REDUCED/DITHERED IMAGE
		canvas = Usage.drawPixels(result.image, result.image.getWidth());
		canvas.id = "reduced-image";
		container = $$("imageView2-image-quantized").getNode().firstElementChild;
		container.innerHTML = "";
		container.appendChild(canvas);

		// DRAW PALETTE
		canvas = Usage.drawPixels(result.palette.getPointContainer(), 16, 128);
		container = $$("imageView2-palette").getNode().firstElementChild;
		container.innerHTML = "";
		container.appendChild(canvas);
	}

	function fillClickToCompare(result) {
		// CLEANUP
		//container.innerHTML = "";
		$$("imageView1-statistics").getNode().firstElementChild.innerHTML = " (SSIM: " + result.ssim.toFixed(2) + ", Time: " + result.time + " )";

		// DRAW ORIGINAL IMAGE
		var canvas = Usage.drawPixels(result.original, result.original.getWidth());
		canvas.id = "original-image";
		//canvas.style.display = "none";
		var container = $$("imageView1-image").getNode().firstElementChild;
		container.innerHTML = "";
		container.appendChild(canvas);

		// DRAW REDUCED/DITHERED IMAGE
		canvas = Usage.drawPixels(result.image, result.image.getWidth());
		canvas.id = "reduced-image";
		container = $$("imageView1-image").getNode().firstElementChild;
		container.innerHTML = "";
		container.appendChild(canvas);

		// DRAW PALETTE
		canvas = Usage.drawPixels(result.palette.getPointContainer(), 16, 128);
		container = $$("imageView1-palette").getNode().firstElementChild;
		container.innerHTML = "";
		container.appendChild(canvas);
	}
});
