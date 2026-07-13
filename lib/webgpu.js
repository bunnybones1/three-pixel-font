var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/WebGPUPixelTextMesh.ts
import { Color as Color2, Vector2 as Vector23, Vector4 as Vector42 } from "three";
import { NodeMaterial } from "three/webgpu";
import {
  Fn,
  floor,
  fract,
  max,
  mix,
  mod,
  positionGeometry,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4
} from "three/tsl";

// src/PixelTextMeshBase.ts
import {
  Matrix4,
  Mesh,
  PlaneGeometry,
  Vector2,
  Vector4
} from "three";

// src/PixelTextLayout.ts
import {
  ClampToEdgeWrapping,
  DataTexture,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
  UVMapping
} from "three";
var maxLines = 2048;
var missingGlyph = "\u25A1";
function createPixelTextLayout(text, fontFace, letterSpacing) {
  if (!fontFace.font || !fontFace.pixelWidths || !fontFace.texture) {
    throw new Error(
      `Pixel font "${fontFace.name}" must finish init() before layout.`
    );
  }
  if (!Number.isInteger(letterSpacing) || letterSpacing > 0) {
    throw new Error("letterSpacing must be a non-positive integer.");
  }
  const lines = text.split("\n").slice(0, maxLines);
  const font = fontFace.font;
  const pixelWidths = fontFace.pixelWidths;
  const maxCharWidth = fontFace.maxCharPixelWidth;
  const overlapPixels = -letterSpacing;
  const missingCharIndex = font.indexOf(missingGlyph);
  if (missingCharIndex === -1) {
    throw new Error(
      `Pixel font "${fontFace.name}" must include ${missingGlyph} as its missing glyph.`
    );
  }
  const missingCharacters = /* @__PURE__ */ new Set();
  const linePixelWidths = lines.map((line) => {
    let pixelLength = 0;
    for (const character of line) {
      let characterIndex = font.indexOf(character);
      if (characterIndex === -1) {
        characterIndex = missingCharIndex;
        missingCharacters.add(character);
      }
      const characterPixelWidth = maxCharWidth - pixelWidths[characterIndex];
      if (overlapPixels >= characterPixelWidth) {
        throw new Error(
          `letterSpacing ${letterSpacing} fully overlaps a glyph in "${fontFace.name}".`
        );
      }
      pixelLength += characterPixelWidth - overlapPixels;
    }
    return pixelLength + overlapPixels;
  });
  const width = Math.max(1, ...linePixelWidths);
  const height = Math.max(1, lines.length);
  const data = new Uint8Array(width * height * 4);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const lineOffset = lineIndex * width;
    const line = lines[lineIndex];
    let xCursor = 0;
    for (let characterIndex = 0; characterIndex <= line.length; characterIndex += 1) {
      const character = line[characterIndex];
      const previousCharacter = line[characterIndex - 1];
      if (!character && !previousCharacter) {
        continue;
      }
      let fontIndex = character === void 0 ? -1 : font.indexOf(character);
      if (fontIndex === -1 && character !== void 0) {
        fontIndex = missingCharIndex;
      }
      const characterPixelWidth = character === void 0 ? 0 : maxCharWidth - pixelWidths[fontIndex];
      for (let pixel = 0; pixel < characterPixelWidth; pixel += 1) {
        const dataIndex = (lineOffset + xCursor) * 4;
        data[dataIndex] = fontIndex;
        data[dataIndex + 1] = (xCursor - pixel) / maxCharWidth % 1 * 255;
        xCursor += 1;
      }
      xCursor -= overlapPixels;
      for (let overlap = 0; overlap < overlapPixels; overlap += 1) {
        const dataIndex = (lineOffset + xCursor + overlap) * 4;
        data[dataIndex + 2] = data[dataIndex];
        data[dataIndex + 3] = data[dataIndex + 1];
      }
    }
  }
  const texture2 = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    UnsignedByteType,
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    NearestFilter,
    NearestFilter
  );
  texture2.needsUpdate = true;
  return {
    heightInChars: lines.length,
    missingCharacters: Array.from(missingCharacters),
    texture: texture2,
    widthInCharColumns: width,
    widthInChars: width / maxCharWidth
  };
}

// src/utils/propertyListeners.ts
var LiveProperty = class {
  constructor(object, propertyName) {
    __publicField(this, "propertyName", propertyName);
    __publicField(this, "object", null);
    __publicField(this, "value");
    __publicField(this, "listeners", /* @__PURE__ */ new Set());
    this.setValue = this.setValue.bind(this);
    this.attach(object);
  }
  get listenerCount() {
    return this.listeners.size;
  }
  addListener(listener, callImmediately) {
    if (callImmediately) {
      listener(this.value);
    }
    this.listeners.add(listener);
  }
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  release() {
    if (!this.object) {
      return;
    }
    Object.defineProperty(this.object, this.propertyName, {
      configurable: true,
      enumerable: true,
      value: this.value,
      writable: true
    });
    this.object = null;
  }
  attach(object) {
    this.object = object;
    this.value = object[this.propertyName];
    Object.defineProperty(object, this.propertyName, {
      configurable: true,
      enumerable: true,
      get: () => this.value,
      set: this.setValue
    });
  }
  setValue(value) {
    if (this.value === value) {
      return;
    }
    const oldValue = this.value;
    this.value = value;
    for (const listener of this.listeners) {
      listener(value, oldValue);
    }
  }
};
var liveProperties = /* @__PURE__ */ new Map();
function getLiveProperty(object, propertyName) {
  let objectProperties = liveProperties.get(object);
  if (!objectProperties) {
    objectProperties = /* @__PURE__ */ new Map();
    liveProperties.set(object, objectProperties);
  }
  let liveProperty = objectProperties.get(propertyName);
  if (!liveProperty) {
    liveProperty = new LiveProperty(object, propertyName);
    objectProperties.set(propertyName, liveProperty);
  }
  return liveProperty;
}
function listenToProperty(object, propertyName, listener, callImmediately = true) {
  getLiveProperty(object, propertyName).addListener(
    listener,
    callImmediately
  );
}
function stopListeningToProperty(object, propertyName, listener) {
  const objectProperties = liveProperties.get(object);
  const liveProperty = objectProperties?.get(propertyName);
  if (!objectProperties || !liveProperty) {
    return;
  }
  liveProperty.removeListener(listener);
  if (liveProperty.listenerCount === 0) {
    liveProperty.release();
    objectProperties.delete(propertyName);
  }
  if (objectProperties.size === 0) {
    liveProperties.delete(object);
  }
}

// src/PixelTextMeshBase.ts
var tempMatrix = new Matrix4();
var fontFaceRenderOrders = /* @__PURE__ */ new WeakMap();
var nextFontFaceRenderOrder = 100;
var blankGeometry = new PlaneGeometry(1e-3, 1e-3);
blankGeometry.computeBoundingBox();
var textGeometry = new PlaneGeometry(1, 1);
var positions = textGeometry.attributes.position;
var positionArray = positions.array;
for (let index = 0; index < positions.count; index += 1) {
  const offset = index * 3;
  positionArray[offset] += 0.5;
  positionArray[offset + 1] -= 0.5;
}
positions.needsUpdate = true;
textGeometry.computeBoundingBox();
function getFontFaceRenderOrder(fontTexture) {
  const existing = fontFaceRenderOrders.get(fontTexture);
  if (existing !== void 0) {
    return existing;
  }
  const renderOrder = nextFontFaceRenderOrder;
  nextFontFaceRenderOrder += 1;
  fontFaceRenderOrders.set(fontTexture, renderOrder);
  return renderOrder;
}
function getTextGeometry(text, settings) {
  return settings.fontFace.font && text ? textGeometry : blankGeometry;
}
var PixelTextMeshBase = class extends Mesh {
  constructor(value, settings, material, onMeasurementsUpdated, onCharSizeUpdated, optimizeRenderOrder = true) {
    super(getTextGeometry(value, settings), material);
    __publicField(this, "value", value);
    __publicField(this, "settings", settings);
    __publicField(this, "onMeasurementsUpdated", onMeasurementsUpdated);
    __publicField(this, "onCharSizeUpdated", onCharSizeUpdated);
    __publicField(this, "optimizeRenderOrder", optimizeRenderOrder);
    __publicField(this, "width", 0);
    __publicField(this, "height", 0);
    __publicField(this, "dirty", false);
    __publicField(this, "fontLoadError");
    __publicField(this, "disposed", false);
    __publicField(this, "fontFace");
    __publicField(this, "layoutTexture");
    __publicField(this, "newFontString");
    __publicField(this, "newTexture");
    __publicField(this, "onBeforeRender", (_renderer, _scene, camera) => {
      if (this.settings.screenSpace) {
        tempMatrix.multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld).premultiply(camera.projectionMatrix);
        const clipSpacePosition = new Vector4(0, 0, 0, 1).applyMatrix4(
          tempMatrix
        );
        this.setClipSpacePosition(clipSpacePosition);
      }
      if (!this.dirty || this.disposed) {
        return;
      }
      this.dirty = false;
      this.regenerateGeometry();
      if (this.newTexture) {
        if (this.optimizeRenderOrder && this.renderOrder === 0) {
          this.renderOrder = getFontFaceRenderOrder(this.newTexture);
        }
        this.setFontTexture(this.newTexture);
        this.newTexture = void 0;
      }
      if (!(this.newFontString && this.value && this.fontFace?.texture)) {
        return;
      }
      const image = this.fontFace.texture.image;
      this.setFontSizeInChars(
        image.width / this.fontFace.maxCharPixelWidth,
        image.height / this.fontFace.charPixelHeight
      );
      const layout = createPixelTextLayout(
        this.value,
        this.fontFace,
        this.settings.letterSpacing
      );
      if (layout.missingCharacters.length > 0) {
        console.warn(
          `Characters in text not found in pixel font: ${layout.missingCharacters.join("")}`
        );
      }
      this.layoutTexture?.dispose();
      this.layoutTexture = layout.texture;
      this.setLayout(
        layout.texture,
        layout.widthInChars,
        layout.heightInChars,
        layout.widthInCharColumns
      );
      this.onCharSizeUpdated?.(
        layout.widthInChars,
        layout.heightInChars
      );
    });
    __publicField(this, "updateText", (value = "") => {
      this.text = `${value}`;
    });
    __publicField(this, "onFontFaceChange", (newFontFace, oldFontFace) => {
      if (oldFontFace) {
        stopListeningToProperty(oldFontFace, "texture", this.onFontTextureUpdate);
        stopListeningToProperty(oldFontFace, "font", this.onFontUpdate);
      }
      listenToProperty(newFontFace, "texture", this.onFontTextureUpdate);
      listenToProperty(newFontFace, "font", this.onFontUpdate);
      this.fontFace = newFontFace;
      this.fontLoadError = void 0;
      void newFontFace.init().catch((error) => {
        this.fontLoadError = error;
      });
    });
    __publicField(this, "onFontTextureUpdate", (fontTexture) => {
      this.newTexture = fontTexture;
      this.dirty = true;
    });
    __publicField(this, "onFontUpdate", (font) => {
      this.newFontString = font;
      this.dirty = true;
    });
    listenToProperty(settings, "fontFace", this.onFontFaceChange, true);
  }
  get text() {
    return this.value;
  }
  set text(value) {
    if (this.value !== value) {
      this.value = value;
      this.dirty = true;
    }
  }
  dispose() {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.releaseListeners();
    this.layoutTexture?.dispose();
    this.layoutTexture = void 0;
    this.material.dispose();
  }
  /** @deprecated Call dispose() when permanently removing the mesh. */
  onRemove() {
    this.releaseListeners();
  }
  regenerateGeometry() {
    this.geometry = getTextGeometry(this.value, this.settings);
    const boundingBox = this.geometry.boundingBox;
    if (!boundingBox) {
      return;
    }
    this.width = boundingBox.max.x - boundingBox.min.x;
    this.height = Math.abs(boundingBox.max.y - boundingBox.min.y);
    this.userData.resolution = new Vector2(this.width, this.height);
    this.onMeasurementsUpdated?.(this);
  }
  releaseListeners() {
    stopListeningToProperty(this.settings, "fontFace", this.onFontFaceChange);
    if (this.fontFace) {
      stopListeningToProperty(
        this.fontFace,
        "texture",
        this.onFontTextureUpdate
      );
      stopListeningToProperty(this.fontFace, "font", this.onFontUpdate);
      this.fontFace = void 0;
    }
  }
};

// src/PixelTextSettings.ts
import { Color } from "three";

// src/PixelFontFace.ts
import { NearestFilter as NearestFilter2 } from "three";

// src/loaders/assetLoader.ts
import { FileLoader, LoadingManager, TextureLoader } from "three";
var loadingManager = new LoadingManager();
var fileLoader = new FileLoader(loadingManager);
var textureLoader = new TextureLoader(loadingManager);
var textRequests = /* @__PURE__ */ new Map();
var textureRequests = /* @__PURE__ */ new Map();
function loadText(url) {
  const existing = textRequests.get(url);
  if (existing) {
    return existing;
  }
  const request = new Promise((resolve, reject) => {
    fileLoader.load(
      url,
      (contents) => {
        resolve(
          typeof contents === "string" ? contents : new TextDecoder().decode(contents)
        );
      },
      void 0,
      reject
    );
  }).catch((error) => {
    textRequests.delete(url);
    throw error;
  });
  textRequests.set(url, request);
  return request;
}
function loadTexture(url, flipY) {
  const existing = textureRequests.get(url);
  if (existing) {
    return existing;
  }
  const request = new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture2) => {
        texture2.name = url;
        if (flipY !== void 0) {
          texture2.flipY = flipY;
        }
        resolve(texture2);
      },
      void 0,
      reject
    );
  }).catch((error) => {
    textureRequests.delete(url);
    throw error;
  });
  textureRequests.set(url, request);
  return request;
}

// src/PixelFontFace.ts
var defaultLoaders = { loadText, loadTexture };
function assetUrl(path, extension) {
  return `${path}.${extension}`;
}
function parsePixelWidths(source) {
  const trimmed = source.trim();
  if (!trimmed) {
    return [];
  }
  if (/[\s,]/.test(trimmed)) {
    return trimmed.split(/[\s,]+/).filter(Boolean).map((value) => Number.parseInt(value, 10));
  }
  return Array.from(trimmed, (value) => Number.parseInt(value, 10));
}
var PixelFontFace = class _PixelFontFace {
  constructor(name, maxCharPixelWidth = 7, charPixelHeight = 8, loaders = defaultLoaders) {
    __publicField(this, "name", name);
    __publicField(this, "maxCharPixelWidth", maxCharPixelWidth);
    __publicField(this, "charPixelHeight", charPixelHeight);
    __publicField(this, "loaders", loaders);
    __publicField(this, "font");
    __publicField(this, "pixelWidths");
    __publicField(this, "texture");
    __publicField(this, "initialization");
  }
  static fromData(name, data, maxCharPixelWidth = 7, charPixelHeight = 8) {
    const face = new _PixelFontFace(
      name,
      maxCharPixelWidth,
      charPixelHeight
    );
    face.applyData(data);
    face.initialization = Promise.resolve();
    return face;
  }
  async init() {
    if (!this.initialization) {
      this.initialization = this.load().catch((error) => {
        this.initialization = void 0;
        throw error;
      });
    }
    return this.initialization;
  }
  applyData(data) {
    const font = data.font.replace(/\r?\n/g, "");
    const pixelWidths = Array.from(data.pixelWidths);
    if (!font) {
      throw new Error(`Pixel font "${this.name}" has no characters.`);
    }
    if (font.length > 256) {
      throw new Error(
        `Pixel font "${this.name}" has ${font.length} characters; the layout texture supports at most 256.`
      );
    }
    if (pixelWidths.length < font.length) {
      throw new Error(
        `Pixel font "${this.name}" has ${font.length} characters but only ${pixelWidths.length} width entries.`
      );
    }
    if (pixelWidths.some(
      (width) => !Number.isInteger(width) || width < 0 || width >= this.maxCharPixelWidth
    )) {
      throw new Error(
        `Pixel font "${this.name}" contains an invalid character-width value.`
      );
    }
    data.texture.minFilter = NearestFilter2;
    data.texture.magFilter = NearestFilter2;
    data.texture.generateMipmaps = false;
    this.texture = data.texture;
    this.pixelWidths = pixelWidths;
    this.font = font;
  }
  async load() {
    const [texture2, widthsSource, font] = await Promise.all([
      this.loaders.loadTexture(assetUrl(this.name, "png")),
      this.loaders.loadText(assetUrl(`${this.name}_char-widths`, "txt")),
      this.loaders.loadText(assetUrl(this.name, "txt"))
    ]);
    this.applyData({
      font,
      pixelWidths: parsePixelWidths(widthsSource),
      texture: texture2
    });
  }
};
var pixelFontFaces = {
  cdogs_font_7x8: new PixelFontFace("pixelFonts/cdogs_font_7x8", 7, 8),
  good_neighbors: new PixelFontFace("pixelFonts/good_neighbors", 11, 16)
};

// src/PixelTextSettings.ts
var generic = {
  align: 0,
  color: new Color(1, 1, 1),
  constantSizeOnScreen: false,
  fontFace: pixelFontFaces.cdogs_font_7x8,
  letterSpacing: -1,
  prescale: 1,
  scaleDownToPhysicalSize: true,
  screenSpace: false,
  strokeColor: new Color(0, 0, 0),
  vAlign: 0
};
var title = {
  ...generic,
  color: new Color(0.75, 1, 0)
};
var pixelTextSettings = { generic, title };

// src/utils/threeUtils.ts
import { DataTexture as DataTexture2, RGBAFormat as RGBAFormat2, UnsignedByteType as UnsignedByteType2 } from "three";
var fallbackTexture;
function getFallbackTexture() {
  if (!fallbackTexture) {
    fallbackTexture = new DataTexture2(
      new Uint8Array(4),
      1,
      1,
      RGBAFormat2,
      UnsignedByteType2
    );
    fallbackTexture.needsUpdate = true;
  }
  return fallbackTexture;
}

// src/WebGPUPixelTextMesh.ts
var WebGPUPixelTextMaterial = class extends NodeMaterial {
  constructor(settings) {
    super();
    __publicField(this, "clipSpacePosition", new Vector42());
    __publicField(this, "fontSizeInChars", new Vector23(1, 1));
    __publicField(this, "layoutSizeInChars", new Vector23(1, 1));
    __publicField(this, "layoutSizeInCharColumns", new Vector23(1, 1));
    __publicField(this, "fontTextureNode", texture(getFallbackTexture()));
    __publicField(this, "layoutTextureNode", texture(getFallbackTexture()));
    this.fontTextureNode.value = settings.fontFace.texture ?? getFallbackTexture();
    const colorNode = uniform(new Color2(settings.color), "color");
    const strokeColorNode = uniform(
      new Color2(settings.strokeColor),
      "color"
    );
    const fontSizeInCharsNode = uniform(this.fontSizeInChars, "vec2");
    const layoutSizeInCharsNode = uniform(this.layoutSizeInChars, "vec2");
    const alignmentNode = uniform(
      new Vector23(settings.align, -settings.vAlign),
      "vec2"
    );
    if (settings.screenSpace) {
      if (!settings.pixelSizeInClipSpaceUniform) {
        throw new Error(
          "screenSpace text requires pixelSizeInClipSpaceUniform."
        );
      }
      const prescaleNode = uniform(settings.prescale);
      const clipSpacePositionNode = uniform(this.clipSpacePosition, "vec4");
      const pixelSizeInClipSpaceNode = uniform(
        settings.pixelSizeInClipSpaceUniform.value,
        "vec2"
      );
      this.vertexNode = Fn(() => {
        const finalOffset = positionGeometry.xy.sub(alignmentNode).mul(pixelSizeInClipSpaceNode).mul(prescaleNode).mul(layoutSizeInCharsNode).toVar();
        if (settings.constantSizeOnScreen) {
          finalOffset.mulAssign(clipSpacePositionNode.w);
        }
        return vec4(
          clipSpacePositionNode.xy.add(finalOffset),
          clipSpacePositionNode.z,
          clipSpacePositionNode.w
        );
      })();
    } else {
      this.positionNode = positionGeometry.sub(vec3(alignmentNode, 0));
    }
    this.fragmentNode = Fn(() => {
      const textUv = uv();
      const uvCharColumns = textUv.mul(layoutSizeInCharsNode);
      const layoutTexel = this.layoutTextureNode.sample(
        vec2(textUv.x, textUv.y.oneMinus())
      );
      const fontCharIndices = layoutTexel.xz.mul(255.0001);
      const charUv = fract(uvCharColumns);
      const layoutCharUv = vec4(
        fract(charUv.x.sub(layoutTexel.y)),
        charUv.y,
        fract(charUv.x.sub(layoutTexel.w)),
        charUv.y
      );
      const fontX = mod(fontCharIndices, fontSizeInCharsNode.x);
      const fontY = vec2(fontSizeInCharsNode.y.sub(1)).sub(
        floor(fontCharIndices.div(fontSizeInCharsNode.x))
      );
      const fontUv = layoutCharUv.add(vec4(fontX.x, fontY.x, fontX.y, fontY.y)).div(fontSizeInCharsNode.xyxy);
      const finalTexel = max(
        this.fontTextureNode.sample(fontUv.xy),
        this.fontTextureNode.sample(fontUv.zw)
      );
      finalTexel.a.lessThan(0.5).discard();
      return vec4(mix(strokeColorNode, colorNode, finalTexel.r), 1);
    })();
    this.depthWrite = true;
  }
  setFontTexture(fontTexture) {
    this.fontTextureNode.value = fontTexture;
  }
  setLayoutTexture(layoutTexture) {
    this.layoutTextureNode.value = layoutTexture;
  }
};
var WebGPUPixelTextMesh = class extends PixelTextMeshBase {
  constructor(text = "", settings = pixelTextSettings.generic, onMeasurementsUpdated, onCharSizeUpdated, optimizeRenderOrder = true) {
    super(
      text,
      settings,
      new WebGPUPixelTextMaterial(settings),
      (mesh) => onMeasurementsUpdated?.(mesh),
      onCharSizeUpdated,
      optimizeRenderOrder
    );
  }
  setClipSpacePosition(position) {
    this.material.clipSpacePosition.copy(position);
  }
  setFontSizeInChars(width, height) {
    this.material.fontSizeInChars.set(width, height);
  }
  setFontTexture(fontTexture) {
    this.material.setFontTexture(fontTexture);
  }
  setLayout(layoutTexture, widthInChars, heightInChars, widthInCharColumns) {
    this.material.setLayoutTexture(layoutTexture);
    this.material.layoutSizeInChars.set(widthInChars, heightInChars);
    this.material.layoutSizeInCharColumns.set(
      widthInCharColumns,
      heightInChars
    );
  }
};
export {
  PixelFontFace,
  WebGPUPixelTextMesh as PixelTextMesh,
  WebGPUPixelTextMesh,
  createPixelTextLayout,
  WebGPUPixelTextMesh as default,
  pixelFontFaces,
  pixelTextSettings
};
//# sourceMappingURL=webgpu.js.map
