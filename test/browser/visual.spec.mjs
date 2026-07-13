import { expect, test } from '@playwright/test'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const fontAssets = [
  'cdogs_font_7x8.png',
  'cdogs_font_7x8.txt',
  'cdogs_font_7x8_char-widths.txt',
]

function countPixels(image, predicate) {
  let count = 0
  for (let offset = 0; offset < image.data.length; offset += 4) {
    if (
      predicate(
        image.data[offset],
        image.data[offset + 1],
        image.data[offset + 2],
      )
    ) {
      count += 1
    }
  }
  return count
}

test('renders matching WebGL and WebGPU bitmap text', async ({
  baseURL,
  page,
  request,
}) => {
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  const response = await page.goto('./')
  expect(response?.ok()).toBe(true)
  await expect(page.locator('html')).toHaveAttribute(
    'data-visual-state',
    'ready',
  )
  await expect(page).toHaveTitle('PASS — three-pixel-font visual tests')
  await expect(page.locator('canvas[data-renderer]')).toHaveCount(2)
  await page.waitForTimeout(500)

  for (const asset of fontAssets) {
    const assetResponse = await request.get(new URL(asset, baseURL).href)
    expect(assetResponse.ok(), `${asset} should resolve through Vite`).toBe(true)
    expect((await assetResponse.body()).byteLength).toBeGreaterThan(0)
  }

  const webgl = PNG.sync.read(
    await page.locator('canvas[data-renderer="webgl"]').screenshot(),
  )
  const webgpu = PNG.sync.read(
    await page.locator('canvas[data-renderer="webgpu"]').screenshot(),
  )

  for (const [renderer, image] of [
    ['WebGL', webgl],
    ['WebGPU', webgpu],
  ]) {
    expect(
      countPixels(image, (red, green, blue) =>
        red > 160 && green < 130 && blue < 150,
      ),
      `${renderer} should render the atlas-backed red text`,
    ).toBeGreaterThan(100)
    expect(
      countPixels(image, (red, green, blue) =>
        red < 150 && green > 130 && blue > 160,
      ),
      `${renderer} should render cyan screen-space text`,
    ).toBeGreaterThan(50)
    expect(
      countPixels(image, (red, green, blue) =>
        red > 180 && green > 130 && blue < 130,
      ),
      `${renderer} should render the JIT DataTexture glyph`,
    ).toBeGreaterThan(10)
  }

  const differentPixels = pixelmatch(
    webgl.data,
    webgpu.data,
    undefined,
    webgl.width,
    webgl.height,
    { threshold: 0.1 },
  )
  expect(differentPixels / (webgl.width * webgl.height)).toBeLessThan(0.01)
  expect(pageErrors).toEqual([])
})
