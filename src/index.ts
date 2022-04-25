import {
  BufferGeometry,
  Camera,
  Color,
  DataTexture,
  DoubleSide,
  Group,
  IUniform,
  Material,
  Matrix4,
  Mesh,
  NearestFilter,
  PlaneBufferGeometry,
  RGBAFormat,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  UnsignedByteType,
  UVMapping,
  Vector2,
  Vector4,
  WebGLRenderer
} from 'three'
import {
  listenToProperty,
  stopListeningToProperty
} from './utils/propertyListeners'
import { getTempTexture } from './utils/threeUtils'

import fragmentShader from './frag.glsl'
import PixelFontFace from './PixelFontFace'
import { pixelTextSettings, PixelTextSettings } from './PixelTextSettings'
import vertexShader from './vert.glsl'

const __mat = new Matrix4()

const trackedFontFaceTextures: Texture[] = []
function getFontFaceSubOrder(texture?: Texture) {
  if (!texture) {
    return -1
  }
  const index = trackedFontFaceTextures.indexOf(texture)
  if (index === -1) {
    trackedFontFaceTextures.push(texture)
    return trackedFontFaceTextures.length - 1
  } else {
    return index
  }
}

const MAX_LINES = 2048

export default class PixelTextMesh extends Mesh {
  width = 0
  height = 0

  dirty = false
  livePropObject?: object
  livePropName?: string

  private _fontFace: PixelFontFace | undefined
  private _newTexture?: Texture
  private _newFontString?: string

  constructor(
    private _text = '',
    public settings: PixelTextSettings = pixelTextSettings.generic,
    public onMeasurementsUpdated?: (mesh: PixelTextMesh) => void,
    public onCharSizeUpdated?: (width: number, height: number) => void,
    public optimizeRenderOrder = true
  ) {
    super(getTextGeometry(_text, settings), initMaterial(settings))

    listenToProperty(settings, 'fontFace', this.onFontFaceChange, true)
  }

  get text() {
    return this._text
  }

  set text(text: string) {
    if (this._text !== text) {
      this._text = text
      this.dirty = true
    }
  }

  onFontFaceChange = (
    newFontFace: PixelFontFace,
    oldFontFace: PixelFontFace
  ) => {
    if (oldFontFace) {
      stopListeningToProperty(oldFontFace, 'texture', this.onFontTextureUpdate)
      stopListeningToProperty(oldFontFace, 'font', this.onFontUpdate)
    }
    listenToProperty(newFontFace, 'texture', this.onFontTextureUpdate)
    listenToProperty(newFontFace, 'font', this.onFontUpdate)

    newFontFace.init()
    this._fontFace = newFontFace
  }

  onFontTextureUpdate = (texture: Texture) => {
    this._newTexture = texture
    this.dirty = true
  }

  onFontUpdate = (fontString: string) => {
    this._newFontString = fontString
    this.dirty = true
  }

  onBeforeRender = (
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    geometry: BufferGeometry,
    material: Material,
    group: Group
  ) => {
    if (this.settings.screenSpace) {
      const clipPos = (this.material as ShaderMaterial)!.uniforms
        .clipSpacePosition.value as Vector4
      __mat
        .multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld)
        .premultiply(camera.projectionMatrix) //.multiply(camera.projectionMatrix)
      clipPos.set(0, 0, 0, 1).applyMatrix4(__mat)
    }
    if (this.dirty) {
      this.dirty = false
      this.regenerateGeometry()
      const m = this.material as ShaderMaterial
      if (this._newTexture) {
        if (this.optimizeRenderOrder) {
          this.renderOrder =
            this.renderOrder || 100 + getFontFaceSubOrder(this._newTexture)
        }
        m.uniforms.fontTexture.value = this._newTexture
        this._newTexture = undefined
      }
      if (this._newFontString && this._text) {
        const lines = this.text.split('\n').slice(0, MAX_LINES)
        const charsHeight = lines.length

        const fontSettings = this.settings.fontFace
        const maxWidthOfChar = fontSettings.maxCharPixelWidth
        const fontString = fontSettings.font!
        const charPixelWidths = fontSettings.pixelWidths!

        const overlapPixels = -this.settings.letterSpacing

        const image = (m.uniforms.fontTexture.value as Texture).image
        m.uniforms.fontSizeInChars.value.set(
          image.width / fontSettings.maxCharPixelWidth,
          image.height / fontSettings.charPixelHeight
        )

        const missingCharIndex = fontString.indexOf('□')
        if (missingCharIndex === -1) {
          throw new Error(
            'Please include this character □ in your font, to stand in for other missing characters'
          )
        }

        let missingChars = ''

        const linePixelWidths = lines.map((lineString) => {
          let pixelLength = 0
          for (let i = 0; i < lineString.length; i++) {
            const char = lineString[i]
            if (char == undefined) {
              continue
            }
            const charIndex = fontString.indexOf(char)
            if (charIndex === -1) {
              pixelLength +=
                maxWidthOfChar -
                charPixelWidths[missingCharIndex] -
                overlapPixels
              if (!missingChars.includes(char)) {
                missingChars += char
              }
            } else {
              pixelLength +=
                maxWidthOfChar - charPixelWidths[charIndex] - overlapPixels
            }
          }
          return pixelLength + overlapPixels
        })

        console.warn('Characters in text not found in font: ' + missingChars)

        const maxPixelWidth = linePixelWidths.reduce(
          (p, c) => Math.max(p, c),
          0
        )

        const total = maxPixelWidth * charsHeight
        const data = new Uint8Array(total * 4)

        for (let iy = 0; iy < charsHeight; iy++) {
          const lineOffset = iy * maxPixelWidth
          let xCursor = 0
          const line = lines[iy]
          const charsWidth = line.length
          for (let ix = 0; ix <= charsWidth; ix++) {
            const char = line[ix]
            const prevChar = line[ix - 1]
            if (!char && !prevChar) {
              continue
            }
            let charIndex = fontString.indexOf(char)
            if (charIndex === -1 && char !== undefined) {
              charIndex = missingCharIndex
            }
            const charPixelWidth = maxWidthOfChar - charPixelWidths[charIndex]
            for (let ipx = 0; ipx < charPixelWidth; ipx++) {
              const index = (lineOffset + xCursor) * 4
              data[index] = charIndex
              data[index + 1] = (((xCursor - ipx) / maxWidthOfChar) % 1) * 255
              xCursor++
            }

            //back up to overlap chars
            xCursor -= overlapPixels
            for (let i = 0; i < overlapPixels; i++) {
              const index = (lineOffset + xCursor + i) * 4
              data[index + 2] = data[index]
              data[index + 3] = data[index + 1]
            }
          }
        }
        m.uniforms.layoutSizeInChars.value.set(
          maxPixelWidth / maxWidthOfChar,
          charsHeight
        )
        m.uniforms.layoutSizeInCharColumns.value.set(maxPixelWidth, charsHeight)
        m.uniforms.layoutTexture.value = new DataTexture(
          data,
          maxPixelWidth,
          charsHeight,
          RGBAFormat,
          UnsignedByteType,
          UVMapping,
          RepeatWrapping,
          RepeatWrapping,
          NearestFilter,
          NearestFilter
        )
        this._newFontString = undefined
        if (this.onCharSizeUpdated) {
          this.onCharSizeUpdated(maxPixelWidth / maxWidthOfChar, charsHeight)
        }
      }
    }
  }

  updateText = (value: any = '') => {
    this.text = `${value}`
  }

  onRemove() {
    stopListeningToProperty(this.settings, 'fontFace', this.onFontFaceChange)
    if (this._fontFace) {
      stopListeningToProperty(
        this._fontFace,
        'texture',
        this.onFontTextureUpdate
      )
      stopListeningToProperty(this._fontFace, 'font', this.onFontUpdate)
    }
  }

  private regenerateGeometry() {
    this.geometry = getTextGeometry(this._text, this.settings)
    this.updateMeasurements()
  }

  private updateMeasurements() {
    const bb = this.geometry.boundingBox!
    this.width = bb.max.x - bb.min.x
    this.height = Math.abs(bb.max.y - bb.min.y)
    this.userData.resolution = new Vector2(this.width, this.height)
    if (this.onMeasurementsUpdated) {
      this.onMeasurementsUpdated(this)
    }
  }
}

interface TextShaderUniforms {
  fontTexture: IUniform<Texture>
  layoutTexture: IUniform<Texture>
  color: IUniform<Color>
  strokeColor: IUniform<Color>
  clipSpacePosition?: IUniform<Vector4>
  pixelSizeInClipSpace?: IUniform<Vector2>
}

const initMaterial = (settings: PixelTextSettings) => {
  const uniforms = {
    layoutTexture: new Uniform(getTempTexture()),
    fontTexture: new Uniform(settings.fontFace.texture),
    color: new Uniform(new Color(settings.color)),
    strokeColor: new Uniform(new Color(settings.strokeColor)),
    fontSizeInChars: new Uniform(new Vector2(1, 1)),
    layoutSizeInChars: new Uniform(new Vector2(1, 1)),
    layoutSizeInCharColumns: new Uniform(new Vector2(1, 1))
  }
  const safeUniforms: TextShaderUniforms = uniforms

  if (settings.screenSpace) {
    safeUniforms.clipSpacePosition = new Uniform(new Vector4())
    if (settings.pixelSizeInClipSpaceUniform) {
      safeUniforms.pixelSizeInClipSpace = settings.pixelSizeInClipSpaceUniform
    } else {
      throw new Error(
        'You must provide a pixelSizeInClipSpaceUniform for screenSpace mode'
      )
    }
  }

  const material = new ShaderMaterial({
    defines: {
      USE_SCREENSPACE: settings.screenSpace,
      CONSTANT_SIZE_ON_SCREEN: settings.constantSizeOnScreen
    },
    uniforms,
    vertexShader,
    fragmentShader,
    depthWrite: true,
    side: DoubleSide
  })

  return material
}

const tempBlankGeo = new PlaneBufferGeometry(0.001, 0.001)
tempBlankGeo.computeBoundingBox()
const textGeo = new PlaneBufferGeometry(1, 1)
const attr = textGeo.attributes.position
const arr = attr.array as number[]
for (let i = 0; i < attr.count; i++) {
  const i3 = i * 3
  arr[i3] += 0.5
  arr[i3 + 1] -= 0.5
}
textGeo.computeBoundingBox()

const getTextGeometry = (
  text: string,
  settings: PixelTextSettings
): BufferGeometry => {
  if (settings.fontFace.font && text) {
    return textGeo
  } else {
    return tempBlankGeo
  }
}
