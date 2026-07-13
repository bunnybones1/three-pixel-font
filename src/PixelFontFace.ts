import { NearestFilter, Texture } from 'three'
import { loadText, loadTexture } from './loaders/assetLoader'

export type PixelFontFaceData = {
  font: string
  pixelWidths: readonly number[]
  texture: Texture
}

export type PixelFontFaceLoaders = {
  loadText(url: string): Promise<string>
  loadTexture(url: string): Promise<Texture>
}

const defaultLoaders: PixelFontFaceLoaders = { loadText, loadTexture }

function assetUrl(path: string, extension: string) {
  return `${path}.${extension}`
}

function parsePixelWidths(source: string) {
  const trimmed = source.trim()
  if (!trimmed) {
    return []
  }
  if (/[\s,]/.test(trimmed)) {
    return trimmed
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((value) => Number.parseInt(value, 10))
  }
  return Array.from(trimmed, (value) => Number.parseInt(value, 10))
}

export default class PixelFontFace {
  font?: string
  pixelWidths?: number[]
  texture?: Texture

  private initialization?: Promise<void>

  constructor(
    public name: string,
    public maxCharPixelWidth = 7,
    public charPixelHeight = 8,
    private readonly loaders: PixelFontFaceLoaders = defaultLoaders,
  ) {}

  static fromData(
    name: string,
    data: PixelFontFaceData,
    maxCharPixelWidth = 7,
    charPixelHeight = 8,
  ) {
    const face = new PixelFontFace(
      name,
      maxCharPixelWidth,
      charPixelHeight,
    )
    face.applyData(data)
    face.initialization = Promise.resolve()
    return face
  }

  async init() {
    if (!this.initialization) {
      this.initialization = this.load().catch((error: unknown) => {
        this.initialization = undefined
        throw error
      })
    }
    return this.initialization
  }

  private applyData(data: PixelFontFaceData) {
    const font = data.font.replace(/\r?\n/g, '')
    const pixelWidths = Array.from(data.pixelWidths)

    if (!font) {
      throw new Error(`Pixel font "${this.name}" has no characters.`)
    }
    if (font.length > 256) {
      throw new Error(
        `Pixel font "${this.name}" has ${font.length} characters; the layout texture supports at most 256.`,
      )
    }
    if (pixelWidths.length < font.length) {
      throw new Error(
        `Pixel font "${this.name}" has ${font.length} characters but only ${pixelWidths.length} width entries.`,
      )
    }
    if (
      pixelWidths.some(
        (width) =>
          !Number.isInteger(width) ||
          width < 0 ||
          width >= this.maxCharPixelWidth,
      )
    ) {
      throw new Error(
        `Pixel font "${this.name}" contains an invalid character-width value.`,
      )
    }

    data.texture.minFilter = NearestFilter
    data.texture.magFilter = NearestFilter
    data.texture.generateMipmaps = false
    this.texture = data.texture
    this.pixelWidths = pixelWidths
    this.font = font
  }

  private async load() {
    const [texture, widthsSource, font] = await Promise.all([
      this.loaders.loadTexture(assetUrl(this.name, 'png')),
      this.loaders.loadText(assetUrl(`${this.name}_char-widths`, 'txt')),
      this.loaders.loadText(assetUrl(this.name, 'txt')),
    ])
    this.applyData({
      font,
      pixelWidths: parsePixelWidths(widthsSource),
      texture,
    })
  }
}

export const pixelFontFaces = {
  cdogs_font_7x8: new PixelFontFace('pixelFonts/cdogs_font_7x8', 7, 8),
  good_neighbors: new PixelFontFace('pixelFonts/good_neighbors', 11, 16),
}
