/// <reference types="vite/client" />

import {
  Color,
  DataTexture,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  UnsignedByteType,
  Uniform,
  Vector2,
  WebGLRenderer,
} from 'three'
import { WebGPURenderer } from 'three/webgpu'
import PixelFontFace from '../src/PixelFontFace'
import PixelTextMesh from '../src/PixelTextMesh'
import type PixelTextMeshBase from '../src/PixelTextMeshBase'
import type { PixelTextSettings } from '../src/PixelTextSettings'
import WebGPUPixelTextMesh from '../src/WebGPUPixelTextMesh'

const viewportWidth = 480
const viewportHeight = 256
const pixelScale = 4
const sampleText = 'PIXEL FONT 1.0\nWebGL + WebGPU\n0123456789 !? □'
const status = document.querySelector<HTMLDivElement>('#status')!
const renders = document.querySelector<HTMLDivElement>('#renders')!
const visualRoot = document.documentElement

type TextMeshConstructor = new (
  text: string,
  settings: PixelTextSettings,
  onMeasurementsUpdated?: (mesh: PixelTextMeshBase<never>) => void,
  onCharSizeUpdated?: (width: number, height: number) => void,
) => PixelTextMeshBase<never>

function createFigure(label: string, renderer: 'webgl' | 'webgpu') {
  const figure = document.createElement('figure')
  figure.dataset.renderer = renderer
  const caption = document.createElement('figcaption')
  caption.textContent = label
  figure.append(caption)
  renders.append(figure)
  return figure
}

function createJitFontFace() {
  const width = 6
  const height = 5
  const pixels = new Uint8Array(width * height * 4)
  const rows = ['.#.', '#.#', '###', '#.#', '#.#']
  for (let y = 0; y < rows.length; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      if (rows[y][x] !== '#') {
        continue
      }
      const offset = (y * width + x) * 4
      pixels[offset] = 255
      pixels[offset + 3] = 255
    }
  }
  return PixelFontFace.fromData(
    'jit-top-down-atlas',
    {
      font: 'A□',
      pixelWidths: [0, 0],
      texture: new DataTexture(
        pixels,
        width,
        height,
        RGBAFormat,
        UnsignedByteType,
      ),
    },
    3,
    5,
  )
}

function createScene(
  MeshClass: TextMeshConstructor,
  fontFace: PixelFontFace,
) {
  const scene = new Scene()
  const camera = new OrthographicCamera(
    -viewportWidth / 2,
    viewportWidth / 2,
    viewportHeight / 2,
    -viewportHeight / 2,
    0.1,
    10,
  )
  camera.position.z = 2

  let mesh: PixelTextMeshBase<never>
  const settings: PixelTextSettings = {
    align: 0.5,
    color: new Color('#f0444f'),
    constantSizeOnScreen: false,
    fontFace,
    letterSpacing: -1,
    prescale: 1,
    scaleDownToPhysicalSize: true,
    screenSpace: false,
    strokeColor: new Color('#16090b'),
    vAlign: 0.5,
  }
  mesh = new MeshClass(sampleText, settings, undefined, (width, height) => {
    mesh.scale.set(
      width * fontFace.maxCharPixelWidth * pixelScale,
      height * fontFace.charPixelHeight * pixelScale,
      1,
    )
  })
  mesh.position.y = 18
  scene.add(mesh)

  const screenSpaceMesh = new MeshClass('SCREEN SPACE', {
    ...settings,
    color: new Color('#6bdcff'),
    constantSizeOnScreen: true,
    pixelSizeInClipSpaceUniform: new Uniform(
      new Vector2(
        (2 * fontFace.maxCharPixelWidth) / viewportWidth,
        (2 * fontFace.charPixelHeight) / viewportHeight,
      ),
    ),
    prescale: 2,
    screenSpace: true,
    strokeColor: new Color('#071b22'),
  })
  screenSpaceMesh.position.y = 94
  scene.add(screenSpaceMesh)

  const jitFontFace = createJitFontFace()
  let jitMesh: PixelTextMeshBase<never>
  jitMesh = new MeshClass(
    'A',
    {
      ...settings,
      color: new Color('#ffd23f'),
      fontFace: jitFontFace,
      strokeColor: new Color('#1f1800'),
    },
    undefined,
    (width, height) => {
      jitMesh.scale.set(
        width * jitFontFace.maxCharPixelWidth * pixelScale,
        height * jitFontFace.charPixelHeight * pixelScale,
        1,
      )
    },
  )
  jitMesh.position.y = -78
  scene.add(jitMesh)
  return { camera, mesh, scene }
}

function assetUrl(path: string) {
  const baseUrl = new URL(import.meta.env.BASE_URL, document.baseURI)
  return new URL(path, baseUrl).href
}

export async function runVisualHarness() {
  visualRoot.dataset.visualState = 'loading'
  const fontFace = new PixelFontFace(assetUrl('cdogs_font_7x8'), 7, 8)
  await fontFace.init()

  const webglRenderer = new WebGLRenderer({
    antialias: false,
    preserveDrawingBuffer: true,
  })
  webglRenderer.setClearColor('#25272a')
  webglRenderer.setPixelRatio(1)
  webglRenderer.setSize(viewportWidth, viewportHeight)
  webglRenderer.domElement.dataset.renderer = 'webgl'
  createFigure('WebGL / ShaderMaterial', 'webgl').append(
    webglRenderer.domElement,
  )
  const webgl = createScene(
    PixelTextMesh as unknown as TextMeshConstructor,
    fontFace,
  )

  if (!navigator.gpu) {
    status.textContent = 'WebGL ready; WebGPU unavailable in this browser.'
    webglRenderer.render(webgl.scene, webgl.camera)
    return
  }

  const webgpuRenderer = new WebGPURenderer({ antialias: false })
  webgpuRenderer.setClearColor('#25272a')
  webgpuRenderer.setPixelRatio(1)
  webgpuRenderer.setSize(viewportWidth, viewportHeight)
  webgpuRenderer.domElement.dataset.renderer = 'webgpu'
  createFigure('WebGPU / TSL NodeMaterial', 'webgpu').append(
    webgpuRenderer.domElement,
  )
  await webgpuRenderer.init()
  const webgpu = createScene(
    WebGPUPixelTextMesh as unknown as TextMeshConstructor,
    fontFace,
  )

  let renderedFrames = 0
  const render = () => {
    webglRenderer.render(webgl.scene, webgl.camera)
    webgpuRenderer.render(webgpu.scene, webgpu.camera)
    renderedFrames += 1
    if (renderedFrames === 2) {
      status.textContent =
        'WebGL and WebGPU running; compare glyph pixels below.'
      document.title = 'PASS — three-pixel-font visual tests'
      visualRoot.dataset.visualState = 'ready'
    }
    requestAnimationFrame(render)
  }
  render()
}
