pushd %~dp0
del /f/q _build/demo.js
del /f/q _build/demo.js.map
tsc demo.ts --sourcemap --out _build/demo.js
popd
