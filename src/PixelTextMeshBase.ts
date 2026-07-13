import {
  Camera,
  Material,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Scene,
  Texture,
  Vector2,
  Vector4,
} from 'three'
import PixelFontFace from './PixelFontFace'
import { createPixelTextLayout } from './PixelTextLayout'
import type { PixelTextSettings } from './PixelTextSettings'
import {
  listenToProperty,
  stopListeningToProperty,
} from './utils/propertyListeners'

const tempMatrix = new Matrix4()
const fontFaceRenderOrders = new WeakMap<Texture, number>()
let nextFontFaceRenderOrder = 100

const blankGeometry = new PlaneGeometry(0.001, 0.001)
blankGeometry.computeBoundingBox()

const textGeometry = new PlaneGeometry(1, 1)
const positions = textGeometry.attributes.position
const positionArray = positions.array as Float32Array
for (let index = 0; index < positions.count; index += 1) {
  const offset = index * 3
  positionArray[offset] += 0.5
  positionArray[offset + 1] -= 0.5
}
positions.needsUpdate = true
textGeometry.computeBoundingBox()

function getFontFaceRenderOrder(fontTexture: Texture) {
  const existing = fontFaceRenderOrders.get(fontTexture)
  if (existing !== undefined) {
    return existing
  }
  const renderOrder = nextFontFaceRenderOrder
  nextFontFaceRenderOrder += 1
  fontFaceRenderOrders.set(fontTexture, renderOrder)
  return renderOrder
}

function getTextGeometry(text: string, settings: PixelTextSettings) {
  return settings.fontFace.font && text ? textGeometry : blankGeometry
}

export default abstract class PixelTextMeshBase<
  MaterialType extends Material,
> extends Mesh<PlaneGeometry, MaterialType> {
  width = 0
  height = 0
  dirty = false
  fontLoadError?: unknown

  private disposed = false
  private fontFace?: PixelFontFace
  private layoutTexture?: Texture
  private newFontString?: string
  private newTexture?: Texture

  protected constructor(
    private value: string,
    public settings: PixelTextSettings,
    material: MaterialType,
    public onMeasurementsUpdated?: (mesh: PixelTextMeshBase<MaterialType>) => void,
    public onCharSizeUpdated?: (width: number, height: number) => void,
    public optimizeRenderOrder = true,
  ) {
    super(getTextGeometry(value, settings), material)
    listenToProperty(settings, 'fontFace', this.onFontFaceChange, true)
  }

  get text() {
    return this.value
  }

  set text(value: string) {
    if (this.value !== value) {
      this.value = value
      this.dirty = true
    }
  }

  override onBeforeRender = (
    _renderer: unknown,
    _scene: Scene,
    camera: Camera,
  ) => {
    if (this.settings.screenSpace) {
      tempMatrix
        .multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld)
        .premultiply(camera.projectionMatrix)
      const clipSpacePosition = new Vector4(0, 0, 0, 1).applyMatrix4(
        tempMatrix,
      )
      this.setClipSpacePosition(clipSpacePosition)
    }

    if (!this.dirty || this.disposed) {
      return
    }
    this.dirty = false
    this.regenerateGeometry()

    if (this.newTexture) {
      if (this.optimizeRenderOrder && this.renderOrder === 0) {
        this.renderOrder = getFontFaceRenderOrder(this.newTexture)
      }
      this.setFontTexture(this.newTexture)
      this.newTexture = undefined
    }

    if (!(this.newFontString && this.value && this.fontFace?.texture)) {
      return
    }

    const image = this.fontFace.texture.image as {
      height: number
      width: number
    }
    this.setFontSizeInChars(
      image.width / this.fontFace.maxCharPixelWidth,
      image.height / this.fontFace.charPixelHeight,
    )
    const layout = createPixelTextLayout(
      this.value,
      this.fontFace,
      this.settings.letterSpacing,
    )
    if (layout.missingCharacters.length > 0) {
      console.warn(
        `Characters in text not found in pixel font: ${layout.missingCharacters.join('')}`,
      )
    }
    this.layoutTexture?.dispose()
    this.layoutTexture = layout.texture
    this.setLayout(
      layout.texture,
      layout.widthInChars,
      layout.heightInChars,
      layout.widthInCharColumns,
    )
    this.onCharSizeUpdated?.(
      layout.widthInChars,
      layout.heightInChars,
    )
  }

  updateText = (value: unknown = '') => {
    this.text = `${value}`
  }

  dispose() {
    if (this.disposed) {
      return
    }
    this.disposed = true
    this.releaseListeners()
    this.layoutTexture?.dispose()
    this.layoutTexture = undefined
    this.material.dispose()
  }

  /** @deprecated Call dispose() when permanently removing the mesh. */
  onRemove() {
    this.releaseListeners()
  }

  protected abstract setClipSpacePosition(position: Vector4): void
  protected abstract setFontSizeInChars(width: number, height: number): void
  protected abstract setFontTexture(texture: Texture): void
  protected abstract setLayout(
    texture: Texture,
    widthInChars: number,
    heightInChars: number,
    widthInCharColumns: number,
  ): void

  private readonly onFontFaceChange = (
    newFontFace: PixelFontFace,
    oldFontFace?: PixelFontFace,
  ) => {
    if (oldFontFace) {
      stopListeningToProperty(oldFontFace, 'texture', this.onFontTextureUpdate)
      stopListeningToProperty(oldFontFace, 'font', this.onFontUpdate)
    }
    listenToProperty(newFontFace, 'texture', this.onFontTextureUpdate)
    listenToProperty(newFontFace, 'font', this.onFontUpdate)
    this.fontFace = newFontFace
    this.fontLoadError = undefined
    void newFontFace.init().catch((error: unknown) => {
      this.fontLoadError = error
    })
  }

  private readonly onFontTextureUpdate = (fontTexture?: Texture) => {
    this.newTexture = fontTexture
    this.dirty = true
  }

  private readonly onFontUpdate = (font?: string) => {
    this.newFontString = font
    this.dirty = true
  }

  private regenerateGeometry() {
    this.geometry = getTextGeometry(this.value, this.settings)
    const boundingBox = this.geometry.boundingBox
    if (!boundingBox) {
      return
    }
    this.width = boundingBox.max.x - boundingBox.min.x
    this.height = Math.abs(boundingBox.max.y - boundingBox.min.y)
    this.userData.resolution = new Vector2(this.width, this.height)
    this.onMeasurementsUpdated?.(this)
  }

  private releaseListeners() {
    stopListeningToProperty(this.settings, 'fontFace', this.onFontFaceChange)
    if (this.fontFace) {
      stopListeningToProperty(
        this.fontFace,
        'texture',
        this.onFontTextureUpdate,
      )
      stopListeningToProperty(this.fontFace, 'font', this.onFontUpdate)
      this.fontFace = undefined
    }
  }
}
