import { build } from 'esbuild'

await build({
  bundle: true,
  entryPoints: ['test/visual.ts'],
  format: 'esm',
  minify: false,
  outfile: 'test-www/index.js',
  sourcemap: true,
  target: ['es2022'],
})
