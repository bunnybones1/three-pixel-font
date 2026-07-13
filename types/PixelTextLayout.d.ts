import { DataTexture } from 'three';
import PixelFontFace from './PixelFontFace';
export type PixelTextLayout = {
    heightInChars: number;
    missingCharacters: readonly string[];
    texture: DataTexture;
    widthInCharColumns: number;
    widthInChars: number;
};
export declare function createPixelTextLayout(text: string, fontFace: PixelFontFace, letterSpacing: number): PixelTextLayout;
