import { Color, Object3D, PerspectiveCamera, WebGLRenderer } from 'three'
import PixelText from '@lib/index'
import { loadText } from '~/loaders/assetLoader'
import { FPSControls } from '~/utils/fpsControls'
import { getUrlFlag } from '~/utils/location'

import { BaseTestScene } from './BaseTestScene'

function url(name: string, ext: string) {
  return `books/${name}.${ext}`
}

export default class TestPixelTextScene extends BaseTestScene {
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
      bookText = await loadText(url('augustine-confessions-276', 'txt'))
      // bookText = '1.0\n1.0.3\n1.0.31\n1.0.3 1\n1 .0.3 1\n-.-.E.E-E'
      // bookText = '© Tomasz Dysinski. Here & now.'
      const textSettings = {
        align: 0,
        vAlign: 0,
        // fontFace: new PixelFontFace('pixelFonts/cdogs_font_7x8', 7, 8),
        fontFace: new PixelText.PixelFontFace(
          'pixelFonts/good_neighbors',
          11,
          16
        ),
        color: new Color(1, 1, 1),
        letterSpacing: -1,
        strokeColor: new Color(0, 0, 0),
        scaleDownToPhysicalSize: true,
        screenSpace: false,
        constantSizeOnScreen: false,
        prescale: 1
      }
      const book = new PixelText.PixelTextMesh(
        bookText,
        textSettings,
        undefined,
        (w:number, h:number) => {
          book.scale.x = 0.01 * w
          book.scale.y = 0.01 * h
          ;(book as Object3D).updateMatrixWorld()
        }
      )
      book.position.set(-0.125, 0, 0)
      this.scene.add(book)
      const label = new PixelText.PixelTextMesh(
        'test',
        textSettings,
        undefined,
        (w:number, h:number) => {
          label.scale.x = 0.01 * w
          label.scale.y = 0.01 * h
          ;(label as Object3D).updateMatrixWorld()
        }
      )
      label.position.set(-0.125, 0.03, 0)
      this.scene.add(label)
      setInterval(() => {
        label.text = 'text update: '+Math.random()
      }, 200)
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
