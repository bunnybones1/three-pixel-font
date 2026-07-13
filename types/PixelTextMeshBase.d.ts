import { Camera, Material, Mesh, PlaneGeometry, Scene, Texture, Vector4 } from 'three';
import type { PixelTextSettings } from './PixelTextSettings';
export default abstract class PixelTextMeshBase<MaterialType extends Material> extends Mesh<PlaneGeometry, MaterialType> {
    private value;
    settings: PixelTextSettings;
    onMeasurementsUpdated?: ((mesh: PixelTextMeshBase<MaterialType>) => void) | undefined;
    onCharSizeUpdated?: ((width: number, height: number) => void) | undefined;
    optimizeRenderOrder: boolean;
    width: number;
    height: number;
    dirty: boolean;
    fontLoadError?: unknown;
    private disposed;
    private fontFace?;
    private layoutTexture?;
    private newFontString?;
    private newTexture?;
    protected constructor(value: string, settings: PixelTextSettings, material: MaterialType, onMeasurementsUpdated?: ((mesh: PixelTextMeshBase<MaterialType>) => void) | undefined, onCharSizeUpdated?: ((width: number, height: number) => void) | undefined, optimizeRenderOrder?: boolean);
    get text(): string;
    set text(value: string);
    onBeforeRender: (_renderer: unknown, _scene: Scene, camera: Camera) => void;
    updateText: (value?: unknown) => void;
    dispose(): void;
    /** @deprecated Call dispose() when permanently removing the mesh. */
    onRemove(): void;
    protected abstract setClipSpacePosition(position: Vector4): void;
    protected abstract setFontSizeInChars(width: number, height: number): void;
    protected abstract setFontTexture(texture: Texture): void;
    protected abstract setLayout(texture: Texture, widthInChars: number, heightInChars: number, widthInCharColumns: number): void;
    private readonly onFontFaceChange;
    private readonly onFontTextureUpdate;
    private readonly onFontUpdate;
    private regenerateGeometry;
    private releaseListeners;
}
