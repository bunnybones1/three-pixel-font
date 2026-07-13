import { Color, Texture, Vector2, Vector4 } from 'three'
import { NodeMaterial } from 'three/webgpu'
import {
  Fn,
  floor,
  fract,
  max,
  mix,
  mod,
  positionGeometry,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import PixelTextMeshBase from './PixelTextMeshBase'
import { PixelTextSettings, pixelTextSettings } from './PixelTextSettings'
import { getFallbackTexture } from './utils/threeUtils'

class WebGPUPixelTextMaterial extends NodeMaterial {
  readonly clipSpacePosition = new Vector4()
  readonly fontSizeInChars = new Vector2(1, 1)
  readonly layoutSizeInChars = new Vector2(1, 1)
  readonly layoutSizeInCharColumns = new Vector2(1, 1)

  private readonly fontTextureNode = texture(getFallbackTexture())
  private readonly layoutTextureNode = texture(getFallbackTexture())

  constructor(settings: PixelTextSettings) {
    super()
    this.fontTextureNode.value =
      settings.fontFace.texture ?? getFallbackTexture()

    const colorNode = uniform(new Color(settings.color), 'color')
    const strokeColorNode = uniform(
      new Color(settings.strokeColor),
      'color',
    )
    const fontSizeInCharsNode = uniform(this.fontSizeInChars, 'vec2')
    const layoutSizeInCharsNode = uniform(this.layoutSizeInChars, 'vec2')
    const alignmentNode = uniform(
      new Vector2(settings.align, -settings.vAlign),
      'vec2',
    )

    if (settings.screenSpace) {
      if (!settings.pixelSizeInClipSpaceUniform) {
        throw new Error(
          'screenSpace text requires pixelSizeInClipSpaceUniform.',
        )
      }
      const prescaleNode = uniform(settings.prescale)
      const clipSpacePositionNode = uniform(this.clipSpacePosition, 'vec4')
      const pixelSizeInClipSpaceNode = uniform(
        settings.pixelSizeInClipSpaceUniform.value,
        'vec2',
      )
      this.vertexNode = Fn(() => {
        const finalOffset = positionGeometry.xy
          .sub(alignmentNode)
          .mul(pixelSizeInClipSpaceNode)
          .mul(prescaleNode)
          .mul(layoutSizeInCharsNode)
          .toVar()
        if (settings.constantSizeOnScreen) {
          finalOffset.mulAssign(clipSpacePositionNode.w)
        }
        return vec4(
          clipSpacePositionNode.xy.add(finalOffset),
          clipSpacePositionNode.z,
          clipSpacePositionNode.w,
        )
      })()
    } else {
      this.positionNode = positionGeometry.sub(vec3(alignmentNode, 0))
    }

    this.fragmentNode = Fn(() => {
      const textUv = uv()
      const uvCharColumns = textUv.mul(layoutSizeInCharsNode)
      const layoutTexel = this.layoutTextureNode.sample(
        vec2(textUv.x, textUv.y.oneMinus()),
      )
      const fontCharIndices = layoutTexel.xz.mul(255.0001)
      const charUv = fract(uvCharColumns)
      const layoutCharUv = vec4(
        fract(charUv.x.sub(layoutTexel.y)),
        charUv.y,
        fract(charUv.x.sub(layoutTexel.w)),
        charUv.y,
      )
      const fontX = mod(fontCharIndices, fontSizeInCharsNode.x)
      const fontY = vec2(fontSizeInCharsNode.y.sub(1)).sub(
        floor(fontCharIndices.div(fontSizeInCharsNode.x)),
      )
      const fontUv = layoutCharUv
        .add(vec4(fontX.x, fontY.x, fontX.y, fontY.y))
        .div(fontSizeInCharsNode.xyxy)
      const finalTexel = max(
        this.fontTextureNode.sample(fontUv.xy),
        this.fontTextureNode.sample(fontUv.zw),
      )
      finalTexel.a.lessThan(0.5).discard()
      return vec4(mix(strokeColorNode, colorNode, finalTexel.r), 1)
    })()
    this.depthWrite = true
  }

  setFontTexture(fontTexture: Texture) {
    this.fontTextureNode.value = fontTexture
  }

  setLayoutTexture(layoutTexture: Texture) {
    this.layoutTextureNode.value = layoutTexture
  }
}

export default class WebGPUPixelTextMesh extends PixelTextMeshBase<WebGPUPixelTextMaterial> {
  constructor(
    text = '',
    settings: PixelTextSettings = pixelTextSettings.generic,
    onMeasurementsUpdated?: (mesh: WebGPUPixelTextMesh) => void,
    onCharSizeUpdated?: (width: number, height: number) => void,
    optimizeRenderOrder = true,
  ) {
    super(
      text,
      settings,
      new WebGPUPixelTextMaterial(settings),
      (mesh) => onMeasurementsUpdated?.(mesh as WebGPUPixelTextMesh),
      onCharSizeUpdated,
      optimizeRenderOrder,
    )
  }

  protected override setClipSpacePosition(position: Vector4) {
    this.material.clipSpacePosition.copy(position)
  }

  protected override setFontSizeInChars(width: number, height: number) {
    this.material.fontSizeInChars.set(width, height)
  }

  protected override setFontTexture(fontTexture: Texture) {
    this.material.setFontTexture(fontTexture)
  }

  protected override setLayout(
    layoutTexture: Texture,
    widthInChars: number,
    heightInChars: number,
    widthInCharColumns: number,
  ) {
    this.material.setLayoutTexture(layoutTexture)
    this.material.layoutSizeInChars.set(widthInChars, heightInChars)
    this.material.layoutSizeInCharColumns.set(
      widthInCharColumns,
      heightInChars,
    )
  }
}
