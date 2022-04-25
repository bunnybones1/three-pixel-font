import { NearestFilter, Texture } from 'three'
import { loadText, loadTexture } from './loaders/assetLoader'

function url(path: string, ext: string) {
  return `${path}.${ext}`
}
export default class PixelFontFace {
  font?: string
  pixelWidths?: number[]
  texture?: Texture
  private _initd = false
  constructor(
    public name: string,
    public maxCharPixelWidth = 7,
    public charPixelHeight = 8
  ) {}
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
  cdogs_font_7x8: new PixelFontFace('pixelFonts/cdogs_font_7x8', 7, 8),
  good_neighbors: new PixelFontFace('pixelFonts/good_neighbors', 11, 16)
}
