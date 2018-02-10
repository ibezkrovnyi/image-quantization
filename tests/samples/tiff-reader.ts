import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

export function getListOfFiles() {
  const dir = path.join(__dirname, 'images');
  return fs.readdirSync(dir)
    .filter(file => { return /\.png$/.test(file) })
    .map(file => ({ fileName: file, decoded: decodePng(path.join(dir, file)) }));
}

function decodePng(path) {
	const buffer = fs.readFileSync(path);
	return PNG.sync.read(buffer);
};
