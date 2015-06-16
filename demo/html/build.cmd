pushd %~dp0
del /f /q build\app.js
del /f /q build\app.js.map
tsc %CD%/src/app.ts --sourcemap --declaration --out build/app.js
popd
