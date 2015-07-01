pushd %~dp0
rem node ../node_modules/mocha/bin/mocha build/test.js
node build/test.js
popd

