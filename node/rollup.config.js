// Based on https://rollupjs.org/tutorial/
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import terser from  '@rollup/plugin-terser'

export default [
  {
    input: 'index.js',
    output: {
      name: 'nodelibs',
      file: '../js/nl.min.js',
      format: 'es',
    },
    plugins: [
      nodeResolve(), 
      commonjs(),
      babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] }),
      terser()
    ]
  }
]