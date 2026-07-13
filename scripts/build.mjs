import { build } from 'esbuild'

await build({
  bundle: true,
  entryPoints: {
    index: 'src/index.ts',
    webgl: 'src/webgl.ts',
    webgpu: 'src/webgpu.ts',
  },
  external: ['three', 'three/*'],
  format: 'esm',
  minify: false,
  outdir: 'lib',
  platform: 'browser',
  sourcemap: true,
  target: ['es2020'],
})
