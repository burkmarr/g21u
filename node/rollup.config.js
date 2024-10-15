// Based on https://rollupjs.org/tutorial/
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import terser from  '@rollup/plugin-terser'

export default [
// browser-friendly UMD build
  {
		input: 'index.js',
		output: {
			name: 'nodelibs',
			file: '../js/nodelibs.min.umd.js',
			format: 'umd',
		},
		plugins: [
	    nodeResolve(), 
      commonjs(),
      babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] }),
      terser()
		]
	}
]