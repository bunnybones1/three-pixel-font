#ifdef USE_SCREENSPACE
  uniform vec2 offset;
  uniform float prescale;
  uniform vec4 clipSpacePosition;
  uniform vec2 pixelSizeInClipSpace;
#endif
varying vec2 vUv;
varying vec2 vUvCharCols;
uniform vec2 layoutSizeInChars;

void main() {
  vUv = uv;
  vUvCharCols = uv * layoutSizeInChars;

  #ifdef USE_SCREENSPACE
    vec2 finalOffset = (offset + position.xy) * pixelSizeInClipSpace * prescale;
    #ifdef CONSTANT_SIZE_ON_SCREEN
     finalOffset *= clipSpacePosition.w;
    #endif
    gl_Position = clipSpacePosition;
    gl_Position.xy += finalOffset;
  #else
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #endif
}