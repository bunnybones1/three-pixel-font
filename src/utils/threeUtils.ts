import { DataTexture, RGBAFormat, UnsignedByteType } from 'three'

let fallbackTexture: DataTexture | undefined

export function getFallbackTexture() {
  if (!fallbackTexture) {
    fallbackTexture = new DataTexture(
      new Uint8Array(4),
      1,
      1,
      RGBAFormat,
      UnsignedByteType,
    )
    fallbackTexture.needsUpdate = true
  }
  return fallbackTexture
}
