pushd %~dp0
del /f /q dist\demo.js
del /f /q dist\demo.js.map
call ../../node_modules/.bin/tsc demo.ts --sourcemap
node demo.js
popd
