pushd %~dp0
del /f /q dist\demo.js
del /f /q dist\demo.js.map
tsc demo.ts --sourcemap
popd
