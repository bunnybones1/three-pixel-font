import PixelFontFace, { pixelFontFaces } from './PixelFontFace';
import PixelTextMesh, { WebGLPixelTextMesh } from './PixelTextMesh';
import { createPixelTextLayout } from './PixelTextLayout';
import { pixelTextSettings } from './PixelTextSettings';
import WebGPUPixelTextMesh from './WebGPUPixelTextMesh';
export { createPixelTextLayout, PixelFontFace, pixelFontFaces, PixelTextMesh, pixelTextSettings, WebGLPixelTextMesh, WebGPUPixelTextMesh, };
export type { PixelFontFaceData, PixelFontFaceLoaders, } from './PixelFontFace';
export type { PixelTextLayout } from './PixelTextLayout';
export type { PixelTextSettings } from './PixelTextSettings';
declare const _default: {
    PixelFontFace: typeof PixelFontFace;
    PixelTextMesh: typeof PixelTextMesh;
    pixelFontFaces: {
        cdogs_font_7x8: PixelFontFace;
        good_neighbors: PixelFontFace;
    };
    pixelTextSettings: {
        generic: import("./PixelTextSettings").PixelTextSettings;
        title: import("./PixelTextSettings").PixelTextSettings;
    };
    WebGLPixelTextMesh: typeof PixelTextMesh;
    WebGPUPixelTextMesh: typeof WebGPUPixelTextMesh;
};
export default _default;
