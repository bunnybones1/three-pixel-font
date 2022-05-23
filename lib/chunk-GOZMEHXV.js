// src/PixelTextSettings.ts
import { Color } from "three";

// src/PixelFontFace.ts
import { NearestFilter } from "three";

// src/loaders/assetLoader.ts
import { FileLoader, LoadingManager, TextureLoader } from "three";
var __loadingManager = new LoadingManager();
var __fileLoader;
function getFileLoader() {
  if (!__fileLoader) {
    __fileLoader = new FileLoader(__loadingManager);
  }
  return __fileLoader;
}
var __textureLoader;
function getTextureLoader() {
  if (!__textureLoader) {
    __textureLoader = new TextureLoader(__loadingManager);
  }
  return __textureLoader;
}
async function loadText(url2) {
  return new Promise((resolve, reject) => getFileLoader().load(url2, (fileContents) => resolve(fileContents), void 0, reject));
}
var __currentlyLoadingTextureResolvers = /* @__PURE__ */ new Map();
async function loadTexture(url2, flipY) {
  let promise;
  if (__currentlyLoadingTextureResolvers.has(url2)) {
    promise = new Promise((resolve, reject) => {
      __currentlyLoadingTextureResolvers.get(url2).push(resolve);
    });
  } else {
    promise = new Promise((resolve, reject) => {
      __currentlyLoadingTextureResolvers.set(url2, [resolve]);
      const onLoad = (texture) => {
        texture.name = url2;
        if (flipY !== void 0) {
          texture.flipY = flipY;
        }
        __currentlyLoadingTextureResolvers.get(url2).forEach((resolve2) => resolve2(texture));
        __currentlyLoadingTextureResolvers.delete(url2);
      };
      getTextureLoader().load(url2, onLoad, void 0, reject);
    });
  }
  return promise;
}

// src/PixelFontFace.ts
function url(path, ext) {
  return `${path}.${ext}`;
}
var PixelFontFace = class {
  constructor(name, maxCharPixelWidth = 7, charPixelHeight = 8) {
    this.name = name;
    this.maxCharPixelWidth = maxCharPixelWidth;
    this.charPixelHeight = charPixelHeight;
  }
  font;
  pixelWidths;
  texture;
  _initd = false;
  async init() {
    if (this._initd) {
      return;
    }
    this._initd = true;
    this.texture = await loadTexture(url(this.name, "png"));
    this.texture.minFilter = NearestFilter;
    this.texture.magFilter = NearestFilter;
    const pixelWidthsString = (await loadText(url(this.name + "_char-widths", "txt"))).split("\n").join("");
    const pixelWidths = [];
    for (let i = 0; i < pixelWidthsString.length; i++) {
      pixelWidths[i] = parseInt(pixelWidthsString[i]);
    }
    this.pixelWidths = pixelWidths;
    this.font = (await loadText(url(this.name, "txt"))).split("\n").join("");
  }
};
var pixelFontFaces = {
  cdogs_font_7x8: new PixelFontFace("pixelFonts/cdogs_font_7x8", 7, 8),
  good_neighbors: new PixelFontFace("pixelFonts/good_neighbors", 11, 16)
};

// src/PixelTextSettings.ts
var generic = {
  fontFace: pixelFontFaces.cdogs_font_7x8,
  align: 0,
  vAlign: 0,
  color: new Color(1, 1, 1),
  letterSpacing: -1,
  strokeColor: new Color(0, 0, 0),
  scaleDownToPhysicalSize: true,
  screenSpace: false,
  constantSizeOnScreen: false,
  prescale: 1
};
var title = {
  ...generic,
  color: new Color(0.75, 1, 0)
};
var pixelTextSettings = {
  generic,
  title
};

export {
  pixelTextSettings
};
//# sourceMappingURL=chunk-GOZMEHXV.js.map
