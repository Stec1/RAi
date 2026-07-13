// Local types for the Explore universe (GENESIS R-01).
//
// `VisualSignature` and `ContentBlock` MIRROR `packages/shared` (types/
// visual-signature.ts, types/observatory.ts). Per the repo convention they
// are declared locally so the web production build never resolves
// workspace packages outside `apps/web`. Keep the declarations in sync
// manually.

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

export type ObservatoryVisibility = 'unpublished' | 'private' | 'public';

// World content — the ordered block list persisted server-side (R-DL-06).
// Image blocks carry no binary until R-02 (`pendingMedia: true`).
export type ContentBlockType = 'heading' | 'text' | 'image' | 'note' | 'link';

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  text?: string;
  caption?: string;
  href?: string;
  label?: string;
  variant?: string;
  fullBleed?: boolean;
  pendingMedia?: boolean;
};

// A world as the terminal consumes it (graph node, registry row,
// inspector card). `slug` doubles as the API `name` — the @name address.
export type World = {
  slug: string;
  name: string;
  title: string;
  tagline: string;
  signature: VisualSignature;
  publishedAt: string | null;
  updatedAt: string | null;
};

// A reference to any selectable entity on the Explore topology — RA or a
// world. (The 'domain' kind died with the domain layer, R-DL-02.)
export type EntityRef =
  | { kind: 'ra' }
  | { kind: 'observatory'; slug: string };

// Real view actions for the topology panel's pill controls (DL-37/DL-43).
export type ViewCommand = {
  action: 'reset' | 'fit' | 'focus';
  token: number;
};
