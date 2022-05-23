import {
  pixelTextSettings
} from "./chunk-PTAM6I3E.js";
import "./chunk-6J2CLONS.js";

// src/index.ts
import {
  Color,
  DataTexture as DataTexture2,
  Matrix4,
  Mesh,
  NearestFilter,
  PlaneBufferGeometry,
  RGBAFormat as RGBAFormat2,
  RepeatWrapping,
  Uniform,
  UnsignedByteType as UnsignedByteType2,
  UVMapping,
  Vector2,
  Vector4,
  RawShaderMaterial
} from "three";

// src/utils/math.ts
import { Plane, Ray, Vector3 } from "three";
var TWO_PI = 2 * Math.PI;
var RADIANS_TO_DEGREES = 180 / Math.PI;
var DEGREES_TO_RADIANS = Math.PI / 180;
var ray = new Ray();
var flatPlane = new Plane(new Vector3(0, -1, 0), 1);
var anyPlane = new Plane(new Vector3(0, -1, 0), 1);
var intersection = new Vector3();
var tau = Math.PI * 2;
var tauAndHalf = Math.PI * 3;
var phi = (Math.sqrt(5) + 1) * 0.5 - 1;
var ga = phi * Math.PI * 2;

// src/utils/arrayUtils.ts
var removeFromArray = (arr2, value, strict = false) => {
  const index = arr2.indexOf(value);
  if (index !== -1) {
    arr2.splice(index, 1);
  } else if (strict) {
    throw new Error("could not find value in array");
  }
  return value;
};

// src/utils/propertyListeners.ts
var LiveProperty = class {
  get listenerCount() {
    return this.listeners.length;
  }
  obj;
  propName;
  value;
  listeners;
  constructor(obj, propName) {
    this.propName = propName;
    this.listeners = [];
    this.setValue = this.setValue.bind(this);
    this.attach(obj);
  }
  attach(obj) {
    if (this.obj) {
      this.release();
    }
    this.obj = obj;
    const value = this.obj[this.propName];
    Object.defineProperty(obj, this.propName, {
      configurable: true,
      set: this.setValue,
      get: () => this.value
    });
    this.setValue(value);
  }
  release() {
    Object.defineProperty(this.obj, this.propName, {
      value: this.value,
      writable: true
    });
  }
  hasListener(listener) {
    return this.listeners.indexOf(listener) !== -1;
  }
  addListener(listener, firstOneForFree = true) {
    if (firstOneForFree) {
      listener(this.value, void 0);
    }
    this.listeners.push(listener);
  }
  removeListener(listener) {
    removeFromArray(this.listeners, listener);
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
var propGroupLibrary = /* @__PURE__ */ new Map();
function getObjectPropGroup(obj) {
  if (!propGroupLibrary.has(obj)) {
    propGroupLibrary.set(obj, /* @__PURE__ */ new Map());
  }
  return propGroupLibrary.get(obj);
}
function getLiveProperty(obj, propName) {
  const objectPropGroup = getObjectPropGroup(obj);
  if (!objectPropGroup.has(propName)) {
    objectPropGroup.set(propName, new LiveProperty(obj, propName));
  }
  return objectPropGroup.get(propName);
}
function listenToProperty(obj, propName, onChange, firstOneForFree = true) {
  getLiveProperty(obj, propName).addListener(onChange, firstOneForFree);
}
function stopListeningToProperty(obj, propName, onChange) {
  const propGroup = propGroupLibrary.get(obj);
  if (propGroup) {
    const liveProp = propGroup.get(propName);
    if (liveProp) {
      liveProp.removeListener(onChange);
      if (liveProp.listenerCount === 0) {
        liveProp.release();
        propGroup.delete(propName);
      }
    }
    if (propGroup.size === 0) {
      propGroupLibrary.delete(obj);
    }
  }
}

// src/utils/threeUtils.ts
import { DataTexture, RGBAFormat, UnsignedByteType } from "three";
var __tempTexture;
function getTempTexture() {
  if (!__tempTexture) {
    const s = 4;
    const total = s * s * 4;
    const data = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      data[i] = 0;
    }
    __tempTexture = new DataTexture(data, s, s, RGBAFormat, UnsignedByteType);
  }
  return __tempTexture;
}

// src/frag.glsl
var frag_default = "precision highp float;uniform sampler2D fontTexture;uniform sampler2D layoutTexture;uniform vec3 color;uniform vec3 strokeColor;uniform vec2 fontSizeInChars;varying vec2 vUv;varying vec2 vUvCharCols;void main(){vec4 layoutTexel=texture2D(layoutTexture,vec2(vUv.x,1.0-vUv.y));vec2 fontCharIndices=layoutTexel.xz*vec2(255.0001);vec4 layoutCharUv=fract(vUvCharCols).xyxy;layoutCharUv.xz=fract(layoutCharUv.xz-layoutTexel.yw);vec2 tA=mod(fontCharIndices,fontSizeInChars.x);vec2 tB=vec2(fontSizeInChars.y-1.0)-floor(fontCharIndices/fontSizeInChars.x);vec4 packedAB=vec4(tA.x,tB.x,tA.y,tB.y);vec4 fontCharIndexUv=(layoutCharUv+packedAB)/fontSizeInChars.xyxy;vec4 texel=texture2D(fontTexture,fontCharIndexUv.xy);vec4 texel2=texture2D(fontTexture,fontCharIndexUv.zw);vec4 final=max(texel,texel2);if(final.a<0.5)discard;vec3 finalColor=mix(strokeColor,color,final.r);gl_FragColor=vec4(finalColor.rgb,1.0);}";

// src/vert.glsl
var vert_default = "uniform vec2 alignment;\n#ifdef USE_SCREENSPACE\nuniform float prescale;uniform vec4 clipSpacePosition;uniform vec2 pixelSizeInClipSpace;\n#else\nuniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;\n#endif\nattribute vec3 position;attribute vec2 uv;varying vec2 vUv;varying vec2 vUvCharCols;uniform vec2 layoutSizeInChars;void main(){vUv=uv;vUvCharCols=uv*layoutSizeInChars;\n#ifdef USE_SCREENSPACE\nvec2 finalOffset=(position.xy-alignment)*pixelSizeInClipSpace*prescale*layoutSizeInChars;\n#ifdef CONSTANT_SIZE_ON_SCREEN\nfinalOffset*=clipSpacePosition.w;\n#endif\ngl_Position=clipSpacePosition;gl_Position.xy+=finalOffset;\n#else\nvec3 pos=position;pos.xy-=alignment;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);\n#endif\n}";

// src/index.ts
var __mat = new Matrix4();
var trackedFontFaceTextures = [];
function getFontFaceSubOrder(texture) {
  if (!texture) {
    return -1;
  }
  const index = trackedFontFaceTextures.indexOf(texture);
  if (index === -1) {
    trackedFontFaceTextures.push(texture);
    return trackedFontFaceTextures.length - 1;
  } else {
    return index;
  }
}
var MAX_LINES = 2048;
var PixelTextMesh = class extends Mesh {
  constructor(_text = "", settings = pixelTextSettings.generic, onMeasurementsUpdated, onCharSizeUpdated, optimizeRenderOrder = true) {
    super(getTextGeometry(_text, settings), initMaterial(settings));
    this._text = _text;
    this.settings = settings;
    this.onMeasurementsUpdated = onMeasurementsUpdated;
    this.onCharSizeUpdated = onCharSizeUpdated;
    this.optimizeRenderOrder = optimizeRenderOrder;
    listenToProperty(settings, "fontFace", this.onFontFaceChange, true);
  }
  width = 0;
  height = 0;
  dirty = false;
  livePropObject;
  livePropName;
  _fontFace;
  _newTexture;
  _newFontString;
  get text() {
    return this._text;
  }
  set text(text) {
    if (this._text !== text) {
      this._text = text;
      this.dirty = true;
    }
  }
  onFontFaceChange = (newFontFace, oldFontFace) => {
    if (oldFontFace) {
      stopListeningToProperty(oldFontFace, "texture", this.onFontTextureUpdate);
      stopListeningToProperty(oldFontFace, "font", this.onFontUpdate);
    }
    listenToProperty(newFontFace, "texture", this.onFontTextureUpdate);
    listenToProperty(newFontFace, "font", this.onFontUpdate);
    newFontFace.init();
    this._fontFace = newFontFace;
  };
  onFontTextureUpdate = (texture) => {
    this._newTexture = texture;
    this.dirty = true;
  };
  onFontUpdate = (fontString) => {
    this._newFontString = fontString;
    this.dirty = true;
  };
  onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
    if (this.settings.screenSpace) {
      const clipPos = this.material.uniforms.clipSpacePosition.value;
      __mat.multiplyMatrices(camera.matrixWorldInverse, this.matrixWorld).premultiply(camera.projectionMatrix);
      clipPos.set(0, 0, 0, 1).applyMatrix4(__mat);
    }
    if (this.dirty) {
      this.dirty = false;
      this.regenerateGeometry();
      const m = this.material;
      if (this._newTexture) {
        if (this.optimizeRenderOrder) {
          this.renderOrder = this.renderOrder || 100 + getFontFaceSubOrder(this._newTexture);
        }
        m.uniforms.fontTexture.value = this._newTexture;
        this._newTexture = void 0;
      }
      if (this._newFontString && this._text) {
        const lines = this.text.split("\n").slice(0, MAX_LINES);
        const charsHeight = lines.length;
        const fontSettings = this.settings.fontFace;
        const maxWidthOfChar = fontSettings.maxCharPixelWidth;
        const fontString = fontSettings.font;
        const charPixelWidths = fontSettings.pixelWidths;
        const overlapPixels = -this.settings.letterSpacing;
        const image = m.uniforms.fontTexture.value.image;
        m.uniforms.fontSizeInChars.value.set(image.width / fontSettings.maxCharPixelWidth, image.height / fontSettings.charPixelHeight);
        const missingCharIndex = fontString.indexOf("\u25A1");
        if (missingCharIndex === -1) {
          throw new Error("Please include this character \u25A1 in your font, to stand in for other missing characters");
        }
        let missingChars = "";
        const linePixelWidths = lines.map((lineString) => {
          let pixelLength = 0;
          for (let i = 0; i < lineString.length; i++) {
            const char = lineString[i];
            if (char == void 0) {
              continue;
            }
            const charIndex = fontString.indexOf(char);
            if (charIndex === -1) {
              pixelLength += maxWidthOfChar - charPixelWidths[missingCharIndex] - overlapPixels;
              if (!missingChars.includes(char)) {
                missingChars += char;
              }
            } else {
              pixelLength += maxWidthOfChar - charPixelWidths[charIndex] - overlapPixels;
            }
          }
          return pixelLength + overlapPixels;
        });
        console.warn("Characters in text not found in font: " + missingChars);
        const maxPixelWidth = linePixelWidths.reduce((p, c) => Math.max(p, c), 0);
        const total = maxPixelWidth * charsHeight;
        const data = new Uint8Array(total * 4);
        for (let iy = 0; iy < charsHeight; iy++) {
          const lineOffset = iy * maxPixelWidth;
          let xCursor = 0;
          const line = lines[iy];
          const charsWidth = line.length;
          for (let ix = 0; ix <= charsWidth; ix++) {
            const char = line[ix];
            const prevChar = line[ix - 1];
            if (!char && !prevChar) {
              continue;
            }
            let charIndex = fontString.indexOf(char);
            if (charIndex === -1 && char !== void 0) {
              charIndex = missingCharIndex;
            }
            const charPixelWidth = maxWidthOfChar - charPixelWidths[charIndex];
            for (let ipx = 0; ipx < charPixelWidth; ipx++) {
              const index = (lineOffset + xCursor) * 4;
              data[index] = charIndex;
              data[index + 1] = (xCursor - ipx) / maxWidthOfChar % 1 * 255;
              xCursor++;
            }
            xCursor -= overlapPixels;
            for (let i = 0; i < overlapPixels; i++) {
              const index = (lineOffset + xCursor + i) * 4;
              data[index + 2] = data[index];
              data[index + 3] = data[index + 1];
            }
          }
        }
        m.uniforms.layoutSizeInChars.value.set(maxPixelWidth / maxWidthOfChar, charsHeight);
        m.uniforms.layoutSizeInCharColumns.value.set(maxPixelWidth, charsHeight);
        m.uniforms.layoutTexture.value = new DataTexture2(data, maxPixelWidth, charsHeight, RGBAFormat2, UnsignedByteType2, UVMapping, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter);
        this._newFontString = void 0;
        if (this.onCharSizeUpdated) {
          this.onCharSizeUpdated(maxPixelWidth / maxWidthOfChar, charsHeight);
        }
      }
    }
  };
  updateText = (value = "") => {
    this.text = `${value}`;
  };
  onRemove() {
    stopListeningToProperty(this.settings, "fontFace", this.onFontFaceChange);
    if (this._fontFace) {
      stopListeningToProperty(this._fontFace, "texture", this.onFontTextureUpdate);
      stopListeningToProperty(this._fontFace, "font", this.onFontUpdate);
    }
  }
  regenerateGeometry() {
    this.geometry = getTextGeometry(this._text, this.settings);
    this.updateMeasurements();
  }
  updateMeasurements() {
    const bb = this.geometry.boundingBox;
    this.width = bb.max.x - bb.min.x;
    this.height = Math.abs(bb.max.y - bb.min.y);
    this.userData.resolution = new Vector2(this.width, this.height);
    if (this.onMeasurementsUpdated) {
      this.onMeasurementsUpdated(this);
    }
  }
};
var initMaterial = (settings) => {
  const uniforms = {
    layoutTexture: new Uniform(getTempTexture()),
    fontTexture: new Uniform(settings.fontFace.texture),
    color: new Uniform(new Color(settings.color)),
    strokeColor: new Uniform(new Color(settings.strokeColor)),
    fontSizeInChars: new Uniform(new Vector2(1, 1)),
    layoutSizeInChars: new Uniform(new Vector2(1, 1)),
    layoutSizeInCharColumns: new Uniform(new Vector2(1, 1)),
    alignment: new Uniform(new Vector2(settings.align, -settings.vAlign))
  };
  const safeUniforms = uniforms;
  if (settings.screenSpace) {
    safeUniforms.prescale = new Uniform(settings.prescale);
    safeUniforms.clipSpacePosition = new Uniform(new Vector4());
    if (settings.pixelSizeInClipSpaceUniform) {
      safeUniforms.pixelSizeInClipSpace = settings.pixelSizeInClipSpaceUniform;
    } else {
      throw new Error("You must provide a pixelSizeInClipSpaceUniform for screenSpace mode");
    }
  }
  const material = new RawShaderMaterial({
    defines: {
      USE_SCREENSPACE: settings.screenSpace,
      CONSTANT_SIZE_ON_SCREEN: settings.constantSizeOnScreen
    },
    uniforms,
    vertexShader: vert_default,
    fragmentShader: frag_default,
    depthWrite: true
  });
  return material;
};
var tempBlankGeo = new PlaneBufferGeometry(1e-3, 1e-3);
tempBlankGeo.computeBoundingBox();
var textGeo = new PlaneBufferGeometry(1, 1);
var attr = textGeo.attributes.position;
var arr = attr.array;
for (let i = 0; i < attr.count; i++) {
  const i3 = i * 3;
  arr[i3] += 0.5;
  arr[i3 + 1] -= 0.5;
}
textGeo.computeBoundingBox();
var getTextGeometry = (text, settings) => {
  if (settings.fontFace.font && text) {
    return textGeo;
  } else {
    return tempBlankGeo;
  }
};
export {
  PixelTextMesh as default
};
//# sourceMappingURL=index.js.map
