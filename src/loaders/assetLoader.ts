import { FileLoader, LoadingManager, Texture, TextureLoader } from 'three'

const loadingManager = new LoadingManager()
const fileLoader = new FileLoader(loadingManager)
const textureLoader = new TextureLoader(loadingManager)
const textRequests = new Map<string, Promise<string>>()
const textureRequests = new Map<string, Promise<Texture>>()

export function loadText(url: string): Promise<string> {
  const existing = textRequests.get(url)
  if (existing) {
    return existing
  }

  const request = new Promise<string>((resolve, reject) => {
    fileLoader.load(
      url,
      (contents: string | ArrayBuffer) => {
        resolve(
          typeof contents === 'string'
            ? contents
            : new TextDecoder().decode(contents),
        )
      },
      undefined,
      reject,
    )
  }).catch((error: unknown) => {
    textRequests.delete(url)
    throw error
  })

  textRequests.set(url, request)
  return request
}

export function loadTexture(url: string, flipY?: boolean): Promise<Texture> {
  const existing = textureRequests.get(url)
  if (existing) {
    return existing
  }

  const request = new Promise<Texture>((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        texture.name = url
        if (flipY !== undefined) {
          texture.flipY = flipY
        }
        resolve(texture)
      },
      undefined,
      reject,
    )
  }).catch((error: unknown) => {
    textureRequests.delete(url)
    throw error
  })

  textureRequests.set(url, request)
  return request
}
