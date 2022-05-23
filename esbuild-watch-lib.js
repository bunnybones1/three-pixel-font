import { build } from "esbuild";
import { glsl } from "esbuild-plugin-glsl";
import { nodeExternalsPlugin }  from 'esbuild-node-externals'

build({
    entryPoints: ['src/index.ts'],
    outdir: 'lib',
    bundle: false,
    sourcemap: true,
    minify: false,
    splitting: true,
    format: 'esm',
    target: ['esnext'],
    tsconfig: './tsconfig.module.json',
    plugins: [
        glsl({
            minify: true
        }),
        nodeExternalsPlugin()
    ],
    watch: true
})
.catch(() => process.exit(1));

