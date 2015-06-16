pushd %~dp0
del /f /q _build\node-iq.js
del /f /q _build\node-iq.js.map

del /f /q _build\browser-iq.js
del /f /q _build\browser-iq.js.map

call tsc %CD%/src/node-iq.ts -module commonjs --sourcemap --declaration --out _build/node-iq.js
call tsc %CD%/src/iq.ts --sourcemap --declaration --out _build/browser-iq.js

del /f /s /q doc
rd /s /q doc
node node_modules\typedoc\bin\typedoc --mode file --out doc --name "Image Quantization Library (image-q)" --readme none "src/iq.ts" --target ES5
popd
