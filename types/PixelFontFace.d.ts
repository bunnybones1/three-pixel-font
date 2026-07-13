import { Texture } from 'three';
export type PixelFontFaceData = {
    /** Whether atlas rows are supplied top-to-bottom. Defaults to true. */
    flipY?: boolean;
    font: string;
    pixelWidths: readonly number[];
    texture: Texture;
};
export type PixelFontFaceLoaders = {
    loadText(url: string): Promise<string>;
    loadTexture(url: string): Promise<Texture>;
};
export default class PixelFontFace {
    name: string;
    maxCharPixelWidth: number;
    charPixelHeight: number;
    private readonly loaders;
    font?: string;
    pixelWidths?: number[];
    texture?: Texture;
    private initialization?;
    constructor(name: string, maxCharPixelWidth?: number, charPixelHeight?: number, loaders?: PixelFontFaceLoaders);
    static fromData(name: string, data: PixelFontFaceData, maxCharPixelWidth?: number, charPixelHeight?: number): PixelFontFace;
    init(): Promise<void>;
    private applyData;
    private load;
}
export declare const pixelFontFaces: {
    cdogs_font_7x8: PixelFontFace;
    good_neighbors: PixelFontFace;
};
