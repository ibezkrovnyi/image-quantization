pushd %~dp0
del /f /q build\test.js
del /f /q build\test.js.map
node ../node_modules/typescript/bin/tsc.js test.ts --sourcemap --out build/test.js
popd

