import { Texture } from 'three';
export default class PixelFontFace {
    name: string;
    maxCharPixelWidth: number;
    font?: string;
    pixelWidths?: number[];
    texture?: Texture;
    private _initd;
    constructor(name: string, maxCharPixelWidth?: number);
    init(): Promise<void>;
}
export declare const pixelFontFaces: {
    cdogs_font_7x8: PixelFontFace;
};
