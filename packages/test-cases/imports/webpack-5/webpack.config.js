module.exports = {
  name: 'main',
  target: 'node',
  output: { libraryTarget: 'commonjs' },
  mode: 'development',
  devtool: false,
  externals: ['tap']
};
