import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url))
const visualRoot = fileURLToPath(new URL('./test-www/', import.meta.url))
const fontAssets = fileURLToPath(
  new URL('./test-www/pixelFonts/', import.meta.url),
)
const visualOutDir = fileURLToPath(
  new URL('./dist/visual/', import.meta.url),
)

export default defineConfig(({ mode }) => ({
  base:
    mode === 'visual-production' ? '/three-pixel-font-visual/' : './',
  build: {
    emptyOutDir: true,
    outDir: visualOutDir,
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
  },
  publicDir: fontAssets,
  root: visualRoot,
  server: {
    fs: {
      allow: [repositoryRoot],
    },
    host: '127.0.0.1',
    port: 4180,
    strictPort: true,
  },
}))
