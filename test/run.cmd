pushd %~dp0
node ../node_modules/mocha/bin/mocha build/test.js
popd

