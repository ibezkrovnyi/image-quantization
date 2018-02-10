import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'dist/esm/image-q.js',
  output: {
    file: 'dist/umd/image-q.umd.js',
    format: 'umd',
    name: 'image-q',
    exports: 'named',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};