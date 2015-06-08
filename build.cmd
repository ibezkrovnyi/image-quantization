pushd %~dp0
del /f /q _build\iq.js
del /f /q _build\iq.js.map
tsc %CD%/src/iq.ts --sourcemap --declaration --out _build/iq.js
popd
