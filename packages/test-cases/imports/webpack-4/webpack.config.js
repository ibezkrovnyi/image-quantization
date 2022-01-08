module.exports = {
  name: 'main',
  target: 'node',
  output: { libraryTarget: 'commonjs' },
  resolve: {
    extensions: ['.js', '.cjs', '.mjs' ],
  },
  mode: 'development',
  devtool: false,
  externals: ['tap']
};
