pushd %~dp0
del /f /q dist\app.js
del /f /q dist\app.js.map
node node_modules\webpack\bin\webpack.js
rem tsc %CD%/src/app.ts --sourcemap --module system --out build/app.js
popd
