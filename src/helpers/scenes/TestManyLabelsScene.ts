import { Color, PerspectiveCamera, WebGLRenderer } from 'three'
import PixelTextMesh from '~/index'
import { loadText } from '~/loaders/assetLoader'
import PixelFontFace from '~/PixelFontFace'
import { PixelTextSettings } from '~/PixelTextSettings'
import { pixelSizeInClipSpaceUniform } from '~/uniforms'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'
import { rand2 } from '~/utils/math'

import { BaseTestScene } from './BaseTestScene'

function url(name: string, ext: string) {
  return `books/${name}.${ext}`
}

export default class TestManyLabelsScene extends BaseTestScene {
  constructor() {
    super()
    this.camera.position.set(0, 0, 0.5)
    this.camera.lookAt(0, 0, 0)
    // this.camera.updateProjectionMatrix()
    const fps = new FPSControls(this.camera as PerspectiveCamera)
    if (getUrlFlag('fpsCam')) {
      fps.toggle(true)
    }

    // const s = 1

    // const hello = new PixelTextMesh(' ABC \n 010 \n ntz \n "#% \n { } \n0ANan')
    // // const hello = new PixelTextMesh('This is the beginning!\nHello World!\nHello World!\nHello World!\nHello World!')
    // hello.scale.multiplyScalar(s)
    // this.scene.add(hello)

    const init = async () => {
      let bookText = 'Hello world.'
      // bookText = '1.0\n1.0.3\n1.0.31\n1.0.3 1\n1 .0.3 1\n-.-.E.E-E'
      // bookText = '© Tomasz Dysinski. Here & now.'

      bookText = await await loadText(url('augustine-confessions-276', 'txt'))
      bookText = bookText.replace(/[^\w\s\']|_/g, "")
         .replace(/\s+/g, " ");

         bookText = bookText.replace(/[0-9]/g, '');
         bookText = bookText.toLowerCase()

         bookText = bookText.replace(/['"]+/g, '')
         
      const labelStrings = bookText
        // .slice(0, 10000)
        .split('\n')
        .join(' ')
        .split(' ')
        .filter((v) => !!v)

      const uniqueWords = new Set(labelStrings)

      console.log(labelStrings.length)
      console.log(uniqueWords.size)
      const uniqueLabelStrings = Array.from(uniqueWords.values()).slice(0, 1000)
      const options: PixelTextSettings = {
        align: 0.5,
        vAlign: 0.5,
        // fontFace: new PixelFontFace('pixelFonts/cdogs_font_7x8', 7, 8),
        fontFace: new PixelFontFace('pixelFonts/good_neighbors', 11, 16),
        color: new Color(1, 1, 1),
        letterSpacing: -1,
        strokeColor: new Color(0, 0, 0),
        scaleDownToPhysicalSize: true,
        screenSpace: true,
        constantSizeOnScreen: false,
        pixelSizeInClipSpaceUniform: pixelSizeInClipSpaceUniform,
        prescale: 10
      }
      for (const labelString of uniqueLabelStrings) {
        const label = new PixelTextMesh(
          labelString,
          options,
          undefined,
          (w, h) => {
            label.scale.x = 0.01 * w
            label.scale.y = 0.01 * h
          }
        )
        label.position
          .set(rand2(1), rand2(1), rand2(1))
          .normalize()
          .multiplyScalar(0.3)
        this.scene.add(label)
      }
    }
    init()
  }
  update(dt: number) {
    super.update(dt)
  }
  render(renderer: WebGLRenderer, dt: number) {
    super.render(renderer, dt)
  }
}
