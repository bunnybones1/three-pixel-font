# three-pixel-font

[![npm version](https://badge.fury.io/js/three-pixel-font.svg)](https://badge.fury.io/js/three-pixel-font)

![Three Pixel Font — WebGL and WebGPU](./assets/three-pixel-font-hero.png)

Pixel-perfect bitmap text meshes for Three.js WebGL and WebGPU. Text layout is
generated just in time as a compact data texture; glyphs remain crisp at
integer pixel sizes and font atlases use nearest-neighbour sampling.

Version 1 targets the latest Three.js release (`0.185.x`) and supports both
renderers through separate tree-shakeable entry points. Version 0.0.13 remains
the final legacy release for Three 0.134.

## Install

```sh
npm install three-pixel-font three
```

## Choose a renderer

For `WebGLRenderer`, the classic `PixelTextMesh` name remains available:

```ts
import PixelTextMesh, {
  PixelFontFace,
  type PixelTextSettings,
} from 'three-pixel-font/webgl'
```

For `WebGPURenderer`, use the WebGPU entry point. It uses TSL and
`NodeMaterial` internally:

```ts
import PixelTextMesh, {
  PixelFontFace,
  type PixelTextSettings,
} from 'three-pixel-font/webgpu'
```

The root entry point also provides named `WebGLPixelTextMesh` and
`WebGPUPixelTextMesh` exports. Prefer the renderer-specific entry point so a
WebGL build does not import WebGPU/TSL code.

## Font assets

A font face uses three files sharing a base URL:

- `font.png`: a fixed-cell glyph atlas.
- `font.txt`: characters in atlas order, with line breaks ignored.
- `font_char-widths.txt`: unused columns per character. Compact single digits
  may wrap across lines; use comma-separated values for multi-digit widths.

The font must contain `□` as the missing-glyph character. Applications host
their own font assets; the package does not install files into a public folder.

```ts
import { Color } from 'three'
import PixelTextMesh, {
  PixelFontFace,
  type PixelTextSettings,
} from 'three-pixel-font/webgpu'

const fontFace = new PixelFontFace('/pixelFonts/cdogs_font_7x8', 7, 8)
await fontFace.init()

const settings: PixelTextSettings = {
  align: 0,
  color: new Color('white'),
  constantSizeOnScreen: false,
  fontFace,
  letterSpacing: -1,
  prescale: 1,
  scaleDownToPhysicalSize: true,
  screenSpace: false,
  strokeColor: new Color('black'),
  vAlign: 0,
}

const label = new PixelTextMesh('READY', settings)
scene.add(label)

// When the label will not be used again:
label.removeFromParent()
label.dispose()
```

Use `PixelFontFace.fromData()` when the texture and metrics are already loaded
or generated at runtime. This is useful for JIT UI-atlas workflows. Runtime
texture rows are treated as top-to-bottom by default; pass `flipY: false` in
the data object only when supplying an already bottom-to-top atlas.

## Screen-space text

Set `screenSpace` and provide a `Uniform<Vector2>` whose value contains the
size of one physical pixel in clip space. Set `constantSizeOnScreen` to cancel
perspective scaling.

## Publishing

```sh
npm test
npm pack --dry-run
npm publish
```

Only the runtime bundles, declarations, README, and license are published.

## Visual harness

Run `npm run dev:visual` to serve the side-by-side WebGL and WebGPU harness at
`http://127.0.0.1:4180/`. Vite serves the bitmap atlas, character map, and
width table as part of the harness. `npm run build:visual` creates the
production output in `dist/visual`.

`npm run test:visual` starts and stops the Vite development server around the
browser assertions. `npm run test:visual:production` does the same with a
production build mounted at `/three-pixel-font-visual/`, exercising non-root
asset URLs. Both checks are included in `npm test` and `npm run release:check`.

The development toolchain is intentionally small: current Three.js and its
types, esbuild 0.28, Vite, Playwright, and TypeScript 6.0. TypeScript 7.0.2 was
evaluated but its compiler currently stalls on the Three.js TSL declaration
graph, so it is not yet suitable for the package build.
