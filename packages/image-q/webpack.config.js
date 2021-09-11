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
          tsconfigRaw: require('./tsconfig.json'),
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
