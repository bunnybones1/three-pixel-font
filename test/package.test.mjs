import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DataTexture,
  RGBAFormat,
  UnsignedByteType,
} from 'three'
import {
  createPixelTextLayout,
  PixelFontFace,
} from '../lib/index.js'
import WebGLPixelTextMesh from '../lib/webgl.js'
import WebGPUPixelTextMesh from '../lib/webgpu.js'

function createFontFace() {
  const texture = new DataTexture(
    new Uint8Array(9 * 5 * 4),
    9,
    5,
    RGBAFormat,
    UnsignedByteType,
  )
  return PixelFontFace.fromData(
    'test-font',
    {
      font: 'AB□',
      pixelWidths: [0, 1, 0],
      texture,
    },
    3,
    5,
  )
}

test('creates compact overlapping layout textures', () => {
  const layout = createPixelTextLayout('AB', createFontFace(), -1)
  assert.equal(layout.widthInCharColumns, 4)
  assert.equal(layout.widthInChars, 4 / 3)
  assert.equal(layout.heightInChars, 1)
  assert.deepEqual(layout.missingCharacters, [])
  assert.equal(layout.texture.image.width, 4)
  assert.equal(layout.texture.image.height, 1)
  layout.texture.dispose()
})

test('reports missing characters and uses the fallback glyph', () => {
  const layout = createPixelTextLayout('Z', createFontFace(), -1)
  assert.deepEqual(layout.missingCharacters, ['Z'])
  layout.texture.dispose()
})

test('constructs and disposes both renderer-specific meshes', () => {
  const fontFace = createFontFace()
  const settings = {
    align: 0,
    color: 0xffffff,
    constantSizeOnScreen: false,
    fontFace,
    letterSpacing: -1,
    prescale: 1,
    scaleDownToPhysicalSize: true,
    screenSpace: false,
    strokeColor: 0x000000,
    vAlign: 0,
  }
  const webglMesh = new WebGLPixelTextMesh('AB', settings)
  const webgpuMesh = new WebGPUPixelTextMesh('AB', settings)
  assert.equal(webglMesh.material.isRawShaderMaterial, true)
  assert.equal(webgpuMesh.material.isNodeMaterial, true)
  webglMesh.dispose()
  webgpuMesh.dispose()
})
