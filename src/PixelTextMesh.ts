import {
  Color,
  ShaderMaterial,
  Texture,
  Uniform,
  Vector2,
  Vector4,
} from 'three'
import PixelTextMeshBase from './PixelTextMeshBase'
import { PixelTextSettings, pixelTextSettings } from './PixelTextSettings'
import { getFallbackTexture } from './utils/threeUtils'

const vertexShader = /* glsl */ `
precision highp float;

uniform vec2 alignment;
uniform vec2 layoutSizeInChars;

#ifdef USE_SCREENSPACE
  uniform float prescale;
  uniform vec4 clipSpacePosition;
  uniform vec2 pixelSizeInClipSpace;
#endif

varying vec2 vUv;
varying vec2 vUvCharCols;

void main() {
  vUv = uv;
  vUvCharCols = uv * layoutSizeInChars;

  #ifdef USE_SCREENSPACE
    vec2 finalOffset = (position.xy - alignment) * pixelSizeInClipSpace * prescale * layoutSizeInChars;
    #ifdef CONSTANT_SIZE_ON_SCREEN
      finalOffset *= clipSpacePosition.w;
    #endif
    gl_Position = clipSpacePosition;
    gl_Position.xy += finalOffset;
  #else
    vec3 alignedPosition = position;
    alignedPosition.xy -= alignment;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(alignedPosition, 1.0);
  #endif
}
`

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D fontTexture;
uniform sampler2D layoutTexture;
uniform vec3 color;
uniform vec3 strokeColor;
uniform vec2 fontSizeInChars;

varying vec2 vUv;
varying vec2 vUvCharCols;

void main() {
  vec4 layoutTexel = texture2D(layoutTexture, vec2(vUv.x, 1.0 - vUv.y));
  vec2 fontCharIndices = layoutTexel.xz * vec2(255.0001);
  vec4 layoutCharUv = fract(vUvCharCols).xyxy;
  layoutCharUv.xz = fract(layoutCharUv.xz - layoutTexel.yw);

  vec2 fontX = mod(fontCharIndices, fontSizeInChars.x);
  vec2 fontY = vec2(fontSizeInChars.y - 1.0) - floor(fontCharIndices / fontSizeInChars.x);
  vec4 glyphPosition = vec4(fontX.x, fontY.x, fontX.y, fontY.y);
  vec4 fontUv = (layoutCharUv + glyphPosition) / fontSizeInChars.xyxy;
  vec4 finalTexel = max(
    texture2D(fontTexture, fontUv.xy),
    texture2D(fontTexture, fontUv.zw)
  );
  if (finalTexel.a < 0.5) discard;

  gl_FragColor = vec4(mix(strokeColor, color, finalTexel.r), 1.0);
  #include <colorspace_fragment>
}
`

type PixelTextUniforms = {
  alignment: Uniform<Vector2>
  clipSpacePosition?: Uniform<Vector4>
  color: Uniform<Color>
  fontSizeInChars: Uniform<Vector2>
  fontTexture: Uniform<Texture>
  layoutSizeInCharColumns: Uniform<Vector2>
  layoutSizeInChars: Uniform<Vector2>
  layoutTexture: Uniform<Texture>
  pixelSizeInClipSpace?: Uniform<Vector2>
  prescale?: Uniform<number>
  strokeColor: Uniform<Color>
}

class WebGLPixelTextMaterial extends ShaderMaterial {
  declare uniforms: PixelTextUniforms

  constructor(settings: PixelTextSettings) {
    const uniforms: PixelTextUniforms = {
      alignment: new Uniform(new Vector2(settings.align, -settings.vAlign)),
      color: new Uniform(new Color(settings.color)),
      fontSizeInChars: new Uniform(new Vector2(1, 1)),
      fontTexture: new Uniform(
        settings.fontFace.texture ?? getFallbackTexture(),
      ),
      layoutSizeInCharColumns: new Uniform(new Vector2(1, 1)),
      layoutSizeInChars: new Uniform(new Vector2(1, 1)),
      layoutTexture: new Uniform(getFallbackTexture()),
      strokeColor: new Uniform(new Color(settings.strokeColor)),
    }
    if (settings.screenSpace) {
      if (!settings.pixelSizeInClipSpaceUniform) {
        throw new Error(
          'screenSpace text requires pixelSizeInClipSpaceUniform.',
        )
      }
      uniforms.clipSpacePosition = new Uniform(new Vector4())
      uniforms.pixelSizeInClipSpace = settings.pixelSizeInClipSpaceUniform
      uniforms.prescale = new Uniform(settings.prescale)
    }

    const defines: Record<string, number> = {}
    if (settings.screenSpace) {
      defines.USE_SCREENSPACE = 1
    }
    if (settings.constantSizeOnScreen) {
      defines.CONSTANT_SIZE_ON_SCREEN = 1
    }

    super({
      defines,
      depthWrite: true,
      fragmentShader,
      uniforms,
      vertexShader,
    })
  }
}

/** Pixel-font mesh for Three's WebGLRenderer. */
export default class PixelTextMesh extends PixelTextMeshBase<WebGLPixelTextMaterial> {
  constructor(
    text = '',
    settings: PixelTextSettings = pixelTextSettings.generic,
    onMeasurementsUpdated?: (mesh: PixelTextMesh) => void,
    onCharSizeUpdated?: (width: number, height: number) => void,
    optimizeRenderOrder = true,
  ) {
    super(
      text,
      settings,
      new WebGLPixelTextMaterial(settings),
      (mesh) => onMeasurementsUpdated?.(mesh as PixelTextMesh),
      onCharSizeUpdated,
      optimizeRenderOrder,
    )
  }

  protected override setClipSpacePosition(position: Vector4) {
    this.material.uniforms.clipSpacePosition?.value.copy(position)
  }

  protected override setFontSizeInChars(width: number, height: number) {
    this.material.uniforms.fontSizeInChars.value.set(width, height)
  }

  protected override setFontTexture(fontTexture: Texture) {
    this.material.uniforms.fontTexture.value = fontTexture
  }

  protected override setLayout(
    layoutTexture: Texture,
    widthInChars: number,
    heightInChars: number,
    widthInCharColumns: number,
  ) {
    this.material.uniforms.layoutTexture.value = layoutTexture
    this.material.uniforms.layoutSizeInChars.value.set(
      widthInChars,
      heightInChars,
    )
    this.material.uniforms.layoutSizeInCharColumns.value.set(
      widthInCharColumns,
      heightInChars,
    )
  }
}

export { PixelTextMesh as WebGLPixelTextMesh }
