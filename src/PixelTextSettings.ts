import { Color, Vector2 } from 'three'
import type { Uniform } from 'three'
import PixelFontFace, { pixelFontFaces } from './PixelFontFace'

export interface PixelTextSettings {
  align: number
  color: Color
  constantSizeOnScreen?: boolean
  fontFace: PixelFontFace
  letterSpacing: number
  pixelSizeInClipSpaceUniform?: Uniform<Vector2>
  prescale: number
  /** @deprecated Retained for 0.x settings compatibility; it has no effect. */
  scaleDownToPhysicalSize: boolean
  screenSpace: boolean
  strokeColor: Color
  vAlign: number
}

const generic: PixelTextSettings = {
  align: 0,
  color: new Color(1, 1, 1),
  constantSizeOnScreen: false,
  fontFace: pixelFontFaces.cdogs_font_7x8,
  letterSpacing: -1,
  prescale: 1,
  scaleDownToPhysicalSize: true,
  screenSpace: false,
  strokeColor: new Color(0, 0, 0),
  vAlign: 0,
}

const title: PixelTextSettings = {
  ...generic,
  color: new Color(0.75, 1, 0),
}

export const pixelTextSettings = { generic, title }
