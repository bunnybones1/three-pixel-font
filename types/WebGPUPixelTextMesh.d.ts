import { Texture, Vector2, Vector4 } from 'three';
import { NodeMaterial } from 'three/webgpu';
import PixelTextMeshBase from './PixelTextMeshBase';
import { PixelTextSettings } from './PixelTextSettings';
declare class WebGPUPixelTextMaterial extends NodeMaterial {
    readonly clipSpacePosition: Vector4;
    readonly fontSizeInChars: Vector2;
    readonly layoutSizeInChars: Vector2;
    readonly layoutSizeInCharColumns: Vector2;
    private readonly fontTextureNode;
    private readonly layoutTextureNode;
    constructor(settings: PixelTextSettings);
    setFontTexture(fontTexture: Texture): void;
    setLayoutTexture(layoutTexture: Texture): void;
}
export default class WebGPUPixelTextMesh extends PixelTextMeshBase<WebGPUPixelTextMaterial> {
    constructor(text?: string, settings?: PixelTextSettings, onMeasurementsUpdated?: (mesh: WebGPUPixelTextMesh) => void, onCharSizeUpdated?: (width: number, height: number) => void, optimizeRenderOrder?: boolean);
    protected setClipSpacePosition(position: Vector4): void;
    protected setFontSizeInChars(width: number, height: number): void;
    protected setFontTexture(fontTexture: Texture): void;
    protected setLayout(layoutTexture: Texture, widthInChars: number, heightInChars: number, widthInCharColumns: number): void;
}
export {};
