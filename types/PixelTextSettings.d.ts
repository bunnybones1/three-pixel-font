import { Color, Vector2 } from 'three';
import type { Uniform } from 'three';
import PixelFontFace from './PixelFontFace';
export interface PixelTextSettings {
    align: number;
    color: Color;
    constantSizeOnScreen?: boolean;
    fontFace: PixelFontFace;
    letterSpacing: number;
    pixelSizeInClipSpaceUniform?: Uniform<Vector2>;
    prescale: number;
    /** @deprecated Retained for 0.x settings compatibility; it has no effect. */
    scaleDownToPhysicalSize: boolean;
    screenSpace: boolean;
    strokeColor: Color;
    vAlign: number;
}
export declare const pixelTextSettings: {
    generic: PixelTextSettings;
    title: PixelTextSettings;
};
