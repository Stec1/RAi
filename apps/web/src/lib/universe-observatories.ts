// Universe observatory normalization (PATCH-PIVOT-06, DL-46).
//
// The Explore graph, registry, and inspector all consume the
// `MockObservatory` shape. Real API observatories (from
// `GET /api/v1/observatories`) and the demo-seed mocks are both mapped
// into that one shape here, then merged (real replaces same-named mock)
// so the rest of the terminal needs no per-source branching.

import type { MockObservatory, VisualSignature } from '../data/mock-observatories';
import { domainColor } from '../components/topology/topology-layout';

// The public list payload shape (mirrors GET /api/v1/observatories).
export interface ObservatoryDTO {
  id: string;
  name: string;
  displayName: string;
  type: string;
  domainIds: string[];
  visualSignature: VisualSignature | null;
  reputationScore: number;
  publicationsCount: number;
}

// Deterministic offset around the parent domain from the name, so
// multiple observatories in one domain don't stack. Radius ~40–70,
// angle spread by hash — stable across reloads.
function hashOffset(seed: string): { x: number; y: number } {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const angle = ((h >>> 0) % 360) * (Math.PI / 180);
  const radius = 42 + ((h >>> 9) % 30);
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

// A concrete hex for a domain slug, or a neutral when unknown (real
// observatories may have no/unresolved domain). domainColor returns a
// CSS var for unknown slugs, which is not a valid canvas/THREE color.
function domainHex(slug: string): string {
  const c = domainColor(slug);
  return c.startsWith('#') ? c : '#8890a8';
}

// A signature derived from the parent-domain color, used when a real
// observatory was created without a visual signature (DL-45: node color
// is the parent domain's; accent is secondary emphasis).
function defaultSignature(domainSlug: string): VisualSignature {
  const primary = domainHex(domainSlug);
  return {
    primaryColor: primary,
    secondaryColor: primary,
    accentColor: '#e8edf5',
    gradientAngle: 32,
    ambientEffect: 'glow',
    effectIntensity: 0.45,
    surfaceStyle: 'smooth',
    nodeStyle: 'point',
  };
}

export function realToObservatory(
  dto: ObservatoryDTO,
  idToSlug: Map<string, string>,
): MockObservatory {
  const domainSlug =
    dto.domainIds.map((id) => idToSlug.get(id)).find((s): s is string => Boolean(s)) ?? '';
  const signature = dto.visualSignature ?? defaultSignature(domainSlug);
  const offset = hashOffset(dto.name);
  return {
    slug: dto.name,
    name: dto.name,
    isDemo: false,
    title: dto.displayName || dto.name,
    domainSlug,
    kind: 'observatory',
    tagline: '',
    signature,
    sections: [], // board isn't persisted yet (DL-42) → empty-state overlay
    cta: null,
    offset,
    fallbackPosition: { x: offset.x * 1.6, y: offset.y * 1.6 },
    reputationScore: dto.reputationScore,
    publicationsCount: dto.publicationsCount,
  };
}

function dedupKey(o: MockObservatory): string {
  return (o.name ?? o.slug).toLowerCase();
}

// Real observatories PLUS the demo mocks the real set doesn't already
// cover (real replaces same-named mock). Real observatories sort first.
export function mergeObservatories(
  real: MockObservatory[],
  mocks: MockObservatory[],
): MockObservatory[] {
  const realKeys = new Set(real.map(dedupKey));
  const keptMocks = mocks.filter((m) => !realKeys.has(dedupKey(m)));
  return [...real, ...keptMocks];
}
