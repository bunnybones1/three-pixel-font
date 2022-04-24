import { Color, Uniform } from 'three'
import {
  COLOR_BLACK,
  COLOR_BUFFED_TEXT,
  COLOR_WHITE
} from './utils/colorLibrary'

import PixelFontFace, { pixelFontFaces } from './PixelFontFace'

export interface PixelTextSettings {
  fontFace: PixelFontFace
  color: Color
  strokeColor: Color
  scaleDownToPhysicalSize: boolean
  screenSpace: boolean
  pixelSizeInClipSpaceUniform?: Uniform
  constantSizeOnScreen?: boolean
  letterSpacing: number
}

const generic: PixelTextSettings = {
  fontFace: pixelFontFaces.cdogs_font_7x8,
  color: COLOR_WHITE,
  letterSpacing: -1,
  strokeColor: COLOR_BLACK,
  scaleDownToPhysicalSize: true,
  screenSpace: false,
  constantSizeOnScreen: false
}
const title: PixelTextSettings = {
  ...generic,
  color: COLOR_BUFFED_TEXT
}

export const pixelTextSettings = {
  generic,
  title
}
