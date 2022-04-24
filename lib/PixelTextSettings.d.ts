import { Color, Uniform } from 'three';
import PixelFontFace from './PixelFontFace';
export interface PixelTextSettings {
    fontFace: PixelFontFace;
    color: Color;
    strokeColor: Color;
    scaleDownToPhysicalSize: boolean;
    screenSpace: boolean;
    pixelSizeInClipSpaceUniform?: Uniform;
    constantSizeOnScreen?: boolean;
    letterSpacing: number;
}
export declare const pixelTextSettings: {
    generic: PixelTextSettings;
    title: PixelTextSettings;
};
