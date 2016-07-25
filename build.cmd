rem @echo off
set BUILD_FOLDER=dist
set DOCUMENTATION_FOLDER=doc
set NODE_LIBRARY_NAME=node-iq
set BROWSER_LIBRARY_NAME=browser-iq

pushd %~dp0

del /f /q %BUILD_FOLDER%\%NODE_LIBRARY_NAME%.js
del /f /q %BUILD_FOLDER%\%NODE_LIBRARY_NAME%.js.map

del /f /q %BUILD_FOLDER%\%BROWSER_LIBRARY_NAME%.js
del /f /q %BUILD_FOLDER%\%BROWSER_LIBRARY_NAME%.js.map

node node_modules\webpack\bin\webpack.js
rem call tsc %CD%/src/%NODE_LIBRARY_NAME%.ts -module commonjs --sourcemap --declaration --out %BUILD_FOLDER%/%NODE_LIBRARY_NAME%.js
rem call tsc %CD%/src/iq.ts --sourcemap --declaration --out %BUILD_FOLDER%/%BROWSER_LIBRARY_NAME%.js

del /f /s /q %BUILD_FOLDER%\%DOCUMENTATION_FOLDER%
rd /s /q %BUILD_FOLDER%\%DOCUMENTATION_FOLDER%
rem old node node_modules\typedoc\bin\typedoc --mode file --out %BUILD_FOLDER%/%DOCUMENTATION_FOLDER% --name "Image Quantization Library (image-q)" --readme none "src/iq.ts" --target ES5
rem node node_modules\typedoc\bin\typedoc --mode file --out %BUILD_FOLDER%/%DOCUMENTATION_FOLDER% --name "Image Quantization Library (image-q)" "src/iq.ts" --target ES5

popd
