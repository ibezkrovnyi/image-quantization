pushd %~dp0
del /f /q build\demo.js
del /f /q build\demo.js.map
tsc demo.ts --sourcemap --out build/demo.js
popd
