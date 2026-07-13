import { Color, RawShaderMaterial, Texture, Uniform, Vector2, Vector4 } from 'three';
import PixelTextMeshBase from './PixelTextMeshBase';
import { PixelTextSettings } from './PixelTextSettings';
type PixelTextUniforms = {
    alignment: Uniform<Vector2>;
    clipSpacePosition?: Uniform<Vector4>;
    color: Uniform<Color>;
    fontSizeInChars: Uniform<Vector2>;
    fontTexture: Uniform<Texture>;
    layoutSizeInCharColumns: Uniform<Vector2>;
    layoutSizeInChars: Uniform<Vector2>;
    layoutTexture: Uniform<Texture>;
    pixelSizeInClipSpace?: Uniform<Vector2>;
    prescale?: Uniform<number>;
    strokeColor: Uniform<Color>;
};
declare class WebGLPixelTextMaterial extends RawShaderMaterial {
    uniforms: PixelTextUniforms;
    constructor(settings: PixelTextSettings);
}
/** Pixel-font mesh for Three's WebGLRenderer. */
export default class PixelTextMesh extends PixelTextMeshBase<WebGLPixelTextMaterial> {
    constructor(text?: string, settings?: PixelTextSettings, onMeasurementsUpdated?: (mesh: PixelTextMesh) => void, onCharSizeUpdated?: (width: number, height: number) => void, optimizeRenderOrder?: boolean);
    protected setClipSpacePosition(position: Vector4): void;
    protected setFontSizeInChars(width: number, height: number): void;
    protected setFontTexture(fontTexture: Texture): void;
    protected setLayout(layoutTexture: Texture, widthInChars: number, heightInChars: number, widthInCharColumns: number): void;
}
export { PixelTextMesh as WebGLPixelTextMesh };
