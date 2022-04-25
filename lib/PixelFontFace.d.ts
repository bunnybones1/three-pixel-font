import { Texture } from 'three';
export default class PixelFontFace {
    name: string;
    maxCharPixelWidth: number;
    charPixelHeight: number;
    font?: string;
    pixelWidths?: number[];
    texture?: Texture;
    private _initd;
    constructor(name: string, maxCharPixelWidth?: number, charPixelHeight?: number);
    init(): Promise<void>;
}
export declare const pixelFontFaces: {
    cdogs_font_7x8: PixelFontFace;
    good_neighbors: PixelFontFace;
};
