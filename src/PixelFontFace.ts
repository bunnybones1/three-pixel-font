import { NearestFilter, Texture } from 'three'
import { loadText, loadTexture } from './loaders/assetLoader'

function url(name: string, ext: string) {
  return `pixelFonts/${name}.${ext}`
}
export default class PixelFontFace {
  font?: string
  pixelWidths?: number[]
  texture?: Texture
  private _initd = false
  constructor(public name: string, public maxCharPixelWidth = 7) {}
  async init() {
    if (this._initd) {
      return
    }
    this._initd = true

    this.texture = await loadTexture(url(this.name, 'png'))
    this.texture.minFilter = NearestFilter
    this.texture.magFilter = NearestFilter

    const pixelWidthsString = (
      await loadText(url(this.name + '_char-widths', 'txt'))
    )
      .split('\n')
      .join('')
    const pixelWidths = []
    for (let i = 0; i < pixelWidthsString.length; i++) {
      pixelWidths[i] = parseInt(pixelWidthsString[i])
    }
    this.pixelWidths = pixelWidths
    this.font = (await loadText(url(this.name, 'txt'))).split('\n').join('')
  }
}

export const pixelFontFaces = {
  cdogs_font_7x8: new PixelFontFace('cdogs_font_7x8', 7)
}
