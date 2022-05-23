import { BufferGeometry, Camera, Group, Material, Mesh, Scene, Texture, WebGLRenderer } from 'three';
import PixelFontFace from './PixelFontFace';
import { PixelTextSettings } from './PixelTextSettings';
export default class PixelTextMesh extends Mesh {
    private _text;
    settings: PixelTextSettings;
    onMeasurementsUpdated?: ((mesh: PixelTextMesh) => void) | undefined;
    onCharSizeUpdated?: ((width: number, height: number) => void) | undefined;
    optimizeRenderOrder: boolean;
    width: number;
    height: number;
    dirty: boolean;
    livePropObject?: object;
    livePropName?: string;
    private _fontFace;
    private _newTexture?;
    private _newFontString?;
    constructor(_text?: string, settings?: PixelTextSettings, onMeasurementsUpdated?: ((mesh: PixelTextMesh) => void) | undefined, onCharSizeUpdated?: ((width: number, height: number) => void) | undefined, optimizeRenderOrder?: boolean);
    get text(): string;
    set text(text: string);
    onFontFaceChange: (newFontFace: PixelFontFace, oldFontFace: PixelFontFace) => void;
    onFontTextureUpdate: (texture: Texture) => void;
    onFontUpdate: (fontString: string) => void;
    onBeforeRender: (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: Group) => void;
    updateText: (value?: any) => void;
    onRemove(): void;
    private regenerateGeometry;
    private updateMeasurements;
}
