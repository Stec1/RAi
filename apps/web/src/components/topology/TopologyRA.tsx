// TopologyRA — the faceted warm-gold crystal hub of the Living Crystal
// Graph (DL-37 amended). A low-poly SVG gem: six facet polygons in
// gold tones around an off-center apex, a soft warm inner light, and a
// bloom halo (the only filter-carrying element on the canvas — perf
// budget, DL-38). RA stays warm white-gold in BOTH themes; the light
// "paper" theme swaps the luminous bloom for a soft warm shadow.
//
// Motion: the existing heartbeat halo pulse and the single expanding
// ripple ring (~14s) are preserved. Interaction is unchanged from
// PATCH-PIVOT-02: the node carries data-slug="ra" for the central
// click-dispatch, reports hover, and keeps the keyboard path — no new
// interactions are added.

import type { KeyboardEvent } from 'react';
import styles from './TopologyRA.module.css';

interface Props {
  hot: boolean;
  onHoverChange: (hovering: boolean) => void;
  onSelect: () => void;
}

// Facet geometry: a vertical gem silhouette with an off-center apex so
// the facets catch "light" from the upper left. Gold range only —
// never magenta (DL-37).
const APEX = [-3, -5];
const RIM: Array<[number, number]> = [
  [0, -33],
  [23, -11],
  [15, 18],
  [0, 31],
  [-15, 18],
  [-23, -11],
];
const FACET_FILLS = [
  '#ffedbe',
  '#f2d488',
  '#dfb95f',
  '#c9a04a',
  '#e3c069',
  '#f8e0a0',
];

export function TopologyRA({ hot, onHoverChange, onSelect }: Props) {
  const handleKey = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label="RA — the coordinating core"
      data-slug="ra"
      style={{ cursor: 'pointer', outline: 'none' }}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      onKeyDown={handleKey}
    >
      <defs>
        {/* Bloom for the hub — the canvas's single glow filter. */}
        <filter id="lcg-ra-bloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="lcg-ra-halo">
          <stop offset="0%" stopColor="#ffd878" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffcf66" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffcf66" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lcg-ra-shadow">
          <stop offset="0%" stopColor="#8a6b2e" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#8a6b2e" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8a6b2e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Heartbeat ripple — one quiet expanding ring per ~14s. */}
      <circle
        r={34}
        fill="none"
        stroke="var(--accent-warm)"
        strokeWidth={1}
        className={styles.ripple}
      />

      {/* Dark theme: luminous bloom halo (pulsing). Light theme: a soft
          warm shadow instead — glow does not read on paper. */}
      <circle
        r={62}
        fill="url(#lcg-ra-halo)"
        filter="url(#lcg-ra-bloom)"
        className={`${styles.haloPulse} ${styles.haloLuminous}`}
      />
      <circle
        r={54}
        fill="url(#lcg-ra-shadow)"
        className={`${styles.haloPulse} ${styles.haloShadow}`}
      />

      {/* Focus/hover ring */}
      <circle
        r={42}
        fill="none"
        stroke="var(--graph-ring)"
        strokeWidth={1}
        style={{ opacity: hot ? 1 : 0, transition: 'opacity 150ms ease' }}
      />

      {/* The faceted gem. Facets fan around an off-center apex; a thin
          warm outline keeps the silhouette crisp at small zoom. */}
      <g className={styles.gem}>
        {RIM.map((point, i) => {
          const next = RIM[(i + 1) % RIM.length]!;
          return (
            <polygon
              key={i}
              points={`${APEX[0]},${APEX[1]} ${point[0]},${point[1]} ${next[0]},${next[1]}`}
              fill={FACET_FILLS[i]}
            />
          );
        })}
        <polygon
          points={RIM.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#fff4d6"
          strokeOpacity={0.65}
          strokeWidth={1}
        />
        {/* Inner light at the apex. */}
        <circle cx={APEX[0]} cy={APEX[1]} r={7} fill="#fff8e4" opacity={0.9} />
      </g>

      {/* Label sits below the core; non-interactive */}
      <text
        y={78}
        textAnchor="middle"
        fontFamily="var(--font-space-grotesk), sans-serif"
        fontSize={13}
        fontWeight={300}
        letterSpacing="0.08em"
        fill="var(--text-primary)"
        style={{ textTransform: 'uppercase' }}
      >
        RA
      </text>
    </g>
  );
}
