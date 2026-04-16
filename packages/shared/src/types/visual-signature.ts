export type AmbientEffect = 'glow' | 'pulse' | 'static' | 'drift';
export type SurfaceStyle = 'smooth' | 'grain' | 'mesh' | 'void';
export type NodeStyle = 'point' | 'ring' | 'pulse' | 'cross';

export type VisualSignature = {
  primaryColor: string;
  secondaryColor: string;
  gradientAngle: number;
  ambientEffect: AmbientEffect;
  effectIntensity: number;
  surfaceStyle: SurfaceStyle;
  accentColor: string;
  nodeStyle: NodeStyle;
};
