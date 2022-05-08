import { Texture } from 'three';
export declare function loadJson(url: string): Promise<object>;
export declare function loadText(url: string): Promise<string>;
export declare function loadTexture(url: string, flipY?: boolean): Promise<Texture>;
