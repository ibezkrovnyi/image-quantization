pushd %~dp0
del /f /q _build\app.js
del /f /q _build\app.js.map
tsc %CD%/src/app.ts --sourcemap --declaration --out _build/app.js
popd
