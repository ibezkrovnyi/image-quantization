module Test {
	var PNGImage : any = require('pngjs-image'),
		path               = require("path"),
		fs                 = require("fs");

	export interface FileRecord {
		file : string;
		image : any;
		pointContainer : IQ.Utils.PointContainer;
	}

	export function processLater(fn : () => any) {
		setTimeout(fn, 1);
	}

	export function createDirectory(dir : string) {
		var folders = path.normalize(dir).replace(/\\/g, "/").split("/");

		if (folders && folders.length > 0) {
			for (var i = 0; i < folders.length; i++) {
				var testDir = folders.slice(0, i + 1).join("/");
				if (!fs.existsSync(testDir)) {
					fs.mkdirSync(testDir);
				}
			}
		}
	}

	export function getFilesInFolder(folder : string, recursive : boolean = true, filter : (file : string) => boolean = null, subFolder : string = null) : string[] {
		var fullFolder  = subFolder === null ? folder : path.join(folder, subFolder),
			folderFiles = fs.readdirSync(fullFolder),
			files       = [];

		folderFiles.forEach(function (file) {
			if (filter && filter(file)) {
				console.log(path.join(fullFolder, file) + " removed by filter");
				return;
			}

			var stat              = fs.statSync(path.join(fullFolder, file)),
				subFolderFileName = subFolder === null ? file : path.join(subFolder, file);

			if (stat.isFile()) {
				files.push(subFolderFileName);
			} else if (stat.isDirectory()) {
				if (recursive) {
					files = files.concat(getFilesInFolder(folder, recursive, filter, subFolderFileName));
				}
			}
		});

		return files.map(function (file) {
			return file.replace(/\\/g, "/");
		});
	}

	export function readSourceFiles(sourceFolder : string, callback : (fileRecords) => void) {
		var files       = getFilesInFolder(sourceFolder, true, file => file.indexOf(".png") === -1),
			fileRecords = [],
			processed   = 0;

		files.forEach(file => {
			PNGImage.readImage(path.join(sourceFolder, file), function (err, image) {
				if (err) {
					console.log("ERROR - " + err + ", " + file);
				} else {
					var w   = image.getWidth(),
						h   = image.getHeight(),
						buf = new IQ.Utils.PointContainer(w, h);

					for (var x = 0; x < w; x++) {
						for (var y = 0; y < h; y++) {
							var idx = image.getIndex(x, y);
							buf.setAt(IQ.Utils.Point.createByRGBA(
								image.getRed(idx),
								image.getGreen(idx),
								image.getBlue(idx),
								image.getAlpha(idx)
							), x, y);
						}
					}
					console.log(file + " read OK");
					fileRecords.push({
						folder         : sourceFolder,
						file           : file,
						image          : image,
						pointContainer : buf
					});
				}
				processed++;
				if (files.length === processed) {
					processLater(() => {
						callback(fileRecords);
					});
				}
			});
		});
	}

}
