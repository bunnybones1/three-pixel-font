import { Color, Uniform } from 'three';
import PixelFontFace from './PixelFontFace';
export interface PixelTextSettings {
    fontFace: PixelFontFace;
    color: Color;
    align: number;
    vAlign: number;
    strokeColor: Color;
    scaleDownToPhysicalSize: boolean;
    screenSpace: boolean;
    pixelSizeInClipSpaceUniform?: Uniform;
    constantSizeOnScreen?: boolean;
    letterSpacing: number;
    prescale: number;
}
export declare const pixelTextSettings: {
    generic: PixelTextSettings;
    title: PixelTextSettings;
};
