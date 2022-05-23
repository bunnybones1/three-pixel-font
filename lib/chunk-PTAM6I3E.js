import {
  pixelFontFaces
} from "./chunk-6J2CLONS.js";

// src/PixelTextSettings.ts
import { Color } from "three";
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
//# sourceMappingURL=chunk-PTAM6I3E.js.map
