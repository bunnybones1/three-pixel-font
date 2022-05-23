declare type DeviceType = 'mobile' | 'tablet' | 'desktop';
declare type DeviceOrientation = 'landscape' | 'portrait';
declare type Listener = () => void;
declare class Device {
    width: number;
    height: number;
    aspect: number;
    deviceWidth: number;
    deviceHeight: number;
    deviceAspect: number;
    orientation: DeviceOrientation;
    pixelRatio: number;
    targetFPS: number;
    useTouch: boolean;
    type: DeviceType;
    listeners: Set<Listener>;
    private cachedPPCm;
    constructor();
    handleChange: () => void;
    onChange(listener: Listener, firstOneForFree?: boolean): () => boolean;
    setFPS(fps?: number): void;
}
declare const device: Device;
export default device;
