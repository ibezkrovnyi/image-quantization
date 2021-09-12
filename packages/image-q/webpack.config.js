const path = require('path');
const webpack = require('webpack');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const baseConfig = {
  devtool: 'cheap-module-source-map',
  mode: 'development',
  entry: {
    'image-q': './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'umd'),
    filename: '[name].js',
    library: 'image-q',
    libraryTarget: 'umd',
    globalObject: `typeof globalThis !== 'undefined' ? globalThis : typeof this !== 'undefined' ? this : typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : null`,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /(.js|.jsx|.ts|.tsx)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015',
          tsconfigRaw: require('./tsconfig.build-webpack.json'),
        },
      },
    ],
  },
};

module.exports = [
  baseConfig,
  {
    ...baseConfig,
    mode: 'production',
    devtool: false,
    entry: {
      'image-q.min': baseConfig.entry['image-q'],
    },
    optimization: {
      minimizer: [
        new ESBuildMinifyPlugin({
          target: 'es2015', // Syntax to compile to (see options below for possible values)
        }),
      ],
    },
  },
];