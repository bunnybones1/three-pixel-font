import {
  ClampToEdgeWrapping,
  DataTexture,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
  UVMapping,
} from 'three'
import PixelFontFace from './PixelFontFace'

const maxLines = 2048
const missingGlyph = '\u25a1'

export type PixelTextLayout = {
  heightInChars: number
  missingCharacters: readonly string[]
  texture: DataTexture
  widthInCharColumns: number
  widthInChars: number
}

export function createPixelTextLayout(
  text: string,
  fontFace: PixelFontFace,
  letterSpacing: number,
): PixelTextLayout {
  if (!fontFace.font || !fontFace.pixelWidths || !fontFace.texture) {
    throw new Error(
      `Pixel font "${fontFace.name}" must finish init() before layout.`,
    )
  }
  if (!Number.isInteger(letterSpacing) || letterSpacing > 0) {
    throw new Error('letterSpacing must be a non-positive integer.')
  }

  const lines = text.split('\n').slice(0, maxLines)
  const font = fontFace.font
  const pixelWidths = fontFace.pixelWidths
  const maxCharWidth = fontFace.maxCharPixelWidth
  const overlapPixels = -letterSpacing
  const missingCharIndex = font.indexOf(missingGlyph)
  if (missingCharIndex === -1) {
    throw new Error(
      `Pixel font "${fontFace.name}" must include ${missingGlyph} as its missing glyph.`,
    )
  }

  const missingCharacters = new Set<string>()
  const linePixelWidths = lines.map((line) => {
    let pixelLength = 0
    for (const character of line) {
      let characterIndex = font.indexOf(character)
      if (characterIndex === -1) {
        characterIndex = missingCharIndex
        missingCharacters.add(character)
      }
      const characterPixelWidth =
        maxCharWidth - pixelWidths[characterIndex]
      if (overlapPixels >= characterPixelWidth) {
        throw new Error(
          `letterSpacing ${letterSpacing} fully overlaps a glyph in "${fontFace.name}".`,
        )
      }
      pixelLength += characterPixelWidth - overlapPixels
    }
    return pixelLength + overlapPixels
  })

  const width = Math.max(1, ...linePixelWidths)
  const height = Math.max(1, lines.length)
  const data = new Uint8Array(width * height * 4)

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const lineOffset = lineIndex * width
    const line = lines[lineIndex]
    let xCursor = 0

    for (
      let characterIndex = 0;
      characterIndex <= line.length;
      characterIndex += 1
    ) {
      const character = line[characterIndex]
      const previousCharacter = line[characterIndex - 1]
      if (!character && !previousCharacter) {
        continue
      }

      let fontIndex = character === undefined ? -1 : font.indexOf(character)
      if (fontIndex === -1 && character !== undefined) {
        fontIndex = missingCharIndex
      }
      const characterPixelWidth =
        character === undefined ? 0 : maxCharWidth - pixelWidths[fontIndex]
      for (let pixel = 0; pixel < characterPixelWidth; pixel += 1) {
        const dataIndex = (lineOffset + xCursor) * 4
        data[dataIndex] = fontIndex
        data[dataIndex + 1] =
          (((xCursor - pixel) / maxCharWidth) % 1) * 255
        xCursor += 1
      }

      xCursor -= overlapPixels
      for (let overlap = 0; overlap < overlapPixels; overlap += 1) {
        const dataIndex = (lineOffset + xCursor + overlap) * 4
        data[dataIndex + 2] = data[dataIndex]
        data[dataIndex + 3] = data[dataIndex + 1]
      }
    }
  }

  const texture = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    UnsignedByteType,
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    NearestFilter,
    NearestFilter,
  )
  texture.needsUpdate = true

  return {
    heightInChars: lines.length,
    missingCharacters: Array.from(missingCharacters),
    texture,
    widthInCharColumns: width,
    widthInChars: width / maxCharWidth,
  }
}
