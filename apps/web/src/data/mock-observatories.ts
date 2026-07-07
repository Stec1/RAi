// DEMO-SEED DATA — PATCH-PIVOT-01, demoted to demo-seed in PATCH-PIVOT-06.
//
// Two hand-written observatories so the universe is never empty. Per DL-46
// the Explore graph now renders REAL observatories from
// `GET /api/v1/observatories` PLUS these mocks, de-duplicated by `name`
// (a real observatory replaces a same-named mock). REMOVE this module once
// enough real observatories exist. The normalized universe type used by
// the graph/registry/inspector is `MockObservatory` (both demo and real
// observatories are mapped into it; see `lib/universe-observatories.ts`).
//
// `VisualSignature` mirrors `packages/shared/src/types/visual-signature.ts`
// (`@rai/shared`). Per the repo convention in `apps/web/src/lib/
// topology-types.ts`, the type is declared locally so the web production
// build never resolves workspace packages outside `apps/web`. Keep the two
// declarations in sync manually.

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

// 'observatory' is the neutral kind for real API observatories — their
// world (real|virtual) is deferred (DL-39), so they are not yet a place
// or a world, just an observatory.
export type ObservatoryKind = 'real-place' | 'virtual-world' | 'observatory';

export type StorySection = {
  heading: string;
  body: string;
};

export type MockObservatory = {
  slug: string;
  /** De-dup key across demo + real (defaults to slug for demos). */
  name?: string;
  title: string;
  domainSlug: string;
  kind: ObservatoryKind;
  tagline: string;
  signature: VisualSignature;
  sections: StorySection[];
  /** Disabled CTA label for a demo art-story; null for real observatories. */
  cta: string | null;
  /** True for demo-seed; false/absent for real API observatories. */
  isDemo?: boolean;
  reputationScore?: number;
  publicationsCount?: number;
  /**
   * Fixed offset from the domain node, in viewBox units. ISSUE-09
   * positioning helpers (`nameHash`) do not exist yet; when they land,
   * offsets move to derived placement.
   */
  offset: { x: number; y: number };
  /**
   * Absolute canvas coordinate used when the owning domain is missing
   * from the fetched payload or its position is non-finite (Phase 4
   * position guards) — the node must never disappear or land on NaN.
   */
  fallbackPosition: { x: number; y: number };
};

export const MOCK_OBSERVATORIES: MockObservatory[] = [
  {
    slug: 'wawel-dragons-hill',
    name: 'wawel-dragons-hill',
    isDemo: true,
    title: "Wawel: The Dragon's Hill",
    domainSlug: 'vorda',
    kind: 'real-place',
    tagline:
      'A limestone hill, a thousand years of Kraków, and the fire underneath.',
    signature: {
      primaryColor: '#d08a4e',
      secondaryColor: '#8a4a32',
      gradientAngle: 24,
      ambientEffect: 'glow',
      effectIntensity: 0.6,
      surfaceStyle: 'grain',
      accentColor: '#ffd9a8',
      nodeStyle: 'ring',
    },
    sections: [
      {
        heading: 'Overture',
        body: 'Every city keeps one place where its whole story can stand in a single view. For Kraków it is Wawel: cathedral, castle, and rock, stacked on a bend of the Vistula. You arrive expecting architecture. You leave having read a biography.',
      },
      {
        heading: 'The Hill',
        body: 'The hill came first. Limestone, riddled with caves, settled long before any crown arrived. Kings built on it because the river bends there and the plain is visible in every direction. Coronations, fires, partitions, restorations — the hill absorbed each one and kept its shape.',
      },
      {
        heading: 'The Dragon',
        body: "Under the rock lives the story children learn first: the Wawel Dragon, defeated not by knights but by a cobbler's trick — a sheepskin stuffed with sulfur. The bronze dragon by the cave still breathes fire on a timer. Nobody old enough to know better seems to mind.",
      },
      {
        heading: 'Notes for the Visitor',
        body: "Come early, before the courtyard fills. The cathedral holds the bells; climb to Sigismund if your shoulders allow it. The dragon's cave opens in season. The river bank below is where the city actually rests.",
      },
    ],
    cta: 'Guided walk — coming soon',
    offset: { x: 54, y: -42 },
    fallbackPosition: { x: -216, y: -194 },
  },
  {
    slug: 'signal-garden',
    name: 'signal-garden',
    isDemo: true,
    title: 'Signal Garden',
    domainSlug: 'draxis',
    kind: 'virtual-world',
    tagline: 'A generative garden that grows from the signals visitors leave behind.',
    signature: {
      primaryColor: '#6a4da8',
      secondaryColor: '#2e6e6a',
      gradientAngle: 152,
      ambientEffect: 'drift',
      effectIntensity: 0.5,
      surfaceStyle: 'mesh',
      accentColor: '#9fe0d8',
      nodeStyle: 'pulse',
    },
    sections: [
      {
        heading: 'Seed',
        body: 'The garden begins as a single procedural stem in a dark field. Every visitor arrives as a signal — a timestamp, a path, a pause — and the stem records it in its geometry. Nothing here is drawn by hand; nothing is stored but the signals themselves. The garden only grows while someone is watching.',
      },
      {
        heading: 'Growth',
        body: 'Signals accumulate into branches. A returning visitor thickens a stem; a long pause opens a leaf; a new path forks the geometry where two curiosities diverged. The palette drifts between violet and teal as density changes, and old growth slowly loses saturation, the way memory does. No two hours of the garden render the same way.',
      },
      {
        heading: 'The Night Bloom',
        body: 'Once a cycle, when activity falls low enough, the garden blooms in the dark: every recorded signal lights at once, briefly — a map of everyone who ever paused here — then settles back into slow growth. Visitors who catch the bloom tend to stay longer than they planned. Some return only for it.',
      },
    ],
    cta: 'Enter the garden — coming soon',
    offset: { x: -58, y: 36 },
    fallbackPosition: { x: -10, y: -270 },
  },
];
