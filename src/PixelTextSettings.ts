import { Color, Uniform } from 'three'

import PixelFontFace, { pixelFontFaces } from './PixelFontFace'

export interface PixelTextSettings {
  fontFace: PixelFontFace
  color: Color
  align: number
  vAlign: number
  strokeColor: Color
  scaleDownToPhysicalSize: boolean
  screenSpace: boolean
  pixelSizeInClipSpaceUniform?: Uniform
  constantSizeOnScreen?: boolean
  letterSpacing: number
  prescale: number
}

const generic: PixelTextSettings = {
  fontFace: pixelFontFaces.cdogs_font_7x8,
  align: 0,
  vAlign: 0,
  color: new Color(1, 1, 1),
  letterSpacing: -1,
  strokeColor: new Color(0, 0, 0),
  scaleDownToPhysicalSize: true,
  screenSpace: false,
  constantSizeOnScreen: false,
  prescale: 1
}
const title: PixelTextSettings = {
  ...generic,
  color: new Color(0.75, 1, 0)
}

export const pixelTextSettings = {
  generic,
  title
}
