import svelte from 'rollup-plugin-svelte';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import pkg from './package.json';

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase());

export default {
  input: 'src/svelte-csv.js',
  output: [
    // { file: pkg.module, 'format': 'esm', name },
    // { file: pkg.main, 'format': 'umd', name },
    // { file: pkg.main, format: 'cjs', name },
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
    },
  ],
  external: ['svelte', 'papaparse'],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    svelte(),
    terser()
  ]
};
