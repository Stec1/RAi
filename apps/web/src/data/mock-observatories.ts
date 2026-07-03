// MOCK DATA — PATCH-PIVOT-01.
//
// Two hand-written observatories so the universe has life before the real
// Observatory model lands. REMOVE this module when real, API-backed
// Observatory data replaces it.
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

export type ObservatoryKind = 'real-place' | 'virtual-world';

export type StorySection = {
  heading: string;
  body: string;
};

export type MockObservatory = {
  slug: string;
  title: string;
  domainSlug: string;
  kind: ObservatoryKind;
  tagline: string;
  signature: VisualSignature;
  sections: StorySection[];
  /** Label for the disabled mock CTA at the end of the art-story. */
  cta: string;
  /**
   * Fixed offset from the domain node, in viewBox units. ISSUE-09
   * positioning helpers (`nameHash`) do not exist yet; when they land,
   * offsets move to derived placement.
   */
  offset: { x: number; y: number };
};

export const MOCK_OBSERVATORIES: MockObservatory[] = [
  {
    slug: 'wawel-dragons-hill',
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
  },
  {
    slug: 'signal-garden',
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
        body: 'The garden begins as a single procedural stem in a dark field. Every visitor arrives as a signal — a timestamp, a path, a pause — and the stem records it. Nothing here is drawn by hand. The garden only grows while someone is watching.',
      },
      {
        heading: 'Growth',
        body: 'Signals accumulate into branches. A returning visitor thickens a stem; a long pause opens a leaf; a new path forks the geometry. The palette drifts between violet and teal as the density changes. No two hours of the garden render the same way.',
      },
      {
        heading: 'The Night Bloom',
        body: 'Once a cycle, when activity falls low enough, the garden blooms in the dark: every recorded signal lights at once, briefly, then settles back into slow growth. Visitors who catch it tend to stay longer than they planned.',
      },
    ],
    cta: 'Enter the garden — coming soon',
    offset: { x: -58, y: 36 },
  },
];
