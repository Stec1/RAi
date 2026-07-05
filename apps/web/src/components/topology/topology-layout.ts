// Pure topology layout helpers for the /explore SVG topology.
//
// Per docs/visual-reference.md and DL-26:
//   • The Explore topology is a clean SVG graph (RA + 7 Domains + lines).
//   • Domains live on two concentric rings around RA — Active sit closer,
//     Coming Soon sit further out — preserving each Domain's seed angle
//     from docs/domain-definitions.md so the topology shape is stable.
//
// Position model:
//   • The DB-seeded `(positionX, positionY)` for each Domain encodes a
//     direction vector relative to RA (its angle is what matters for
//     ISSUE-08R). We extract the angle and re-place each Domain on a
//     ring whose radius depends only on its `active` flag.
//   • Radii differ per breakpoint so the topology stays readable from
//     mobile (smaller viewport, smaller radii) to desktop.

export type DomainSeed = {
  slug: string;
  name: string;
  active: boolean;
  positionX: number;
  positionY: number;
  theme?: string;
  description?: string;
};

export type Vec2 = { x: number; y: number };

/**
 * Compute on-canvas (x, y) positions for each Domain.
 * Active Domains land on the inner ring (`activeRadius`), Coming Soon on
 * the outer ring (`comingRadius`). The angle is derived from each seed
 * so artistic intent (which Domain sits where around RA) is preserved.
 */
export function computeDomainPositions(
  domains: DomainSeed[],
  opts: { activeRadius: number; comingRadius: number },
): Record<string, Vec2> {
  const out: Record<string, Vec2> = {};
  for (const d of domains) {
    const angle = Math.atan2(d.positionY, d.positionX);
    const r = d.active ? opts.activeRadius : opts.comingRadius;
    out[d.slug] = { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  }
  return out;
}

// Domain accent colors. Source: docs/domain-definitions.md color hints.
// Kept as concrete hex (not CSS vars) because they're consumed in SVG
// attribute strings (stroke, fill) and as alpha-suffixed shades.
export const DOMAIN_COLOR: Record<string, string> = {
  nexum: '#4a7dbf', // cool blue (Technology, AI, development)
  keth: '#c98a4a', // warm copper (Business, products)
  solum: '#5aa37a', // warm green (Science, research)
  vorda: '#b86b8a', // creative rose (Creativity, art, design)
  lyren: '#7e5ec6', // deep violet (Music, sound)
  auren: '#3f8c8a', // teal (Nature, philosophy, reflection)
  draxis: '#8a3a3a', // dark red (Unknown, experimentation)
};

export function domainColor(slug: string): string {
  return DOMAIN_COLOR[slug] ?? 'var(--text-secondary)';
}

/**
 * Gently curved edge path between two points (Living Crystal Graph,
 * DL-37 amended): a quadratic bezier whose control point sits on the
 * chord's perpendicular, alternating side by `index` so the fan reads
 * organic. `bend` scales the curvature (fraction of chord length).
 */
export function curvedEdgePath(
  from: Vec2,
  to: Vec2,
  index: number,
  bend = 0.09,
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const mx = from.x + dx / 2;
  const my = from.y + dy / 2;
  const nx = -dy / len;
  const ny = dx / len;
  const k = (index % 2 === 0 ? 1 : -1) * len * bend;
  return `M ${from.x} ${from.y} Q ${mx + nx * k} ${my + ny * k} ${to.x} ${to.y}`;
}

// Two-ring radii. Desktop gives the topology room to breathe; mobile
// pulls the rings inward so labels stay legible on a 375px-wide canvas.
export const DESKTOP_RADII = { activeRadius: 220, comingRadius: 310 };
export const MOBILE_RADII = { activeRadius: 150, comingRadius: 210 };

// Breakpoint matching the page CSS (mobile ≤ 768px).
export const MOBILE_MAX_WIDTH = 768;
