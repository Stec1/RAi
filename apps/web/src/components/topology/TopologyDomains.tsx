// TopologyDomains — the 7 Domain nodes as glowing identity-colored orbs
// (Living Crystal Graph, DL-37 amended).
//
//   • Active domains: a radial-gradient orb (hot white center → identity
//     color) inside a soft bloom halo; slightly larger; breathing.
//   • Coming-soon domains: smaller, dimmer, cooler — minimal bloom, an
//     outlined disc with a faint fill; still and quiet.
//   • Hover or selection draws the outer ring (150ms) — same behavior,
//     new luminance.
//
// Interaction is unchanged from PATCH-PIVOT-02: mouse/touch selection is
// dispatched centrally by TopologyCanvas from its pointerup hit-test
// (pointer capture retargets click events to the <svg> root); this
// component reports hover and handles the keyboard path. Labels keep the
// existing type scale.

import type { CSSProperties, KeyboardEvent } from 'react';
import type { DomainSeed, Vec2 } from './topology-layout';
import { domainColor } from './topology-layout';
import styles from './TopologyDomains.module.css';

interface Props {
  domains: DomainSeed[];
  positions: Record<string, Vec2>;
  hoveredSlug: string | null;
  selectedSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}

const ACTIVE_RADIUS = 15;
const COMING_RADIUS = 10;

export function TopologyDomains({
  domains,
  positions,
  hoveredSlug,
  selectedSlug,
  onHover,
  onSelect,
}: Props) {
  return (
    <g>
      {/* Per-domain orb gradients. Defined once for the whole set. */}
      <defs>
        {domains.map((d) => {
          const accent = domainColor(d.slug);
          return (
            <g key={`defs-${d.slug}`}>
              <radialGradient id={`lcg-orb-${d.slug}`}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="38%" stopColor={accent} stopOpacity="1" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.88" />
              </radialGradient>
              <radialGradient id={`lcg-bloom-${d.slug}`}>
                <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
                <stop offset="60%" stopColor={accent} stopOpacity="0.16" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>
            </g>
          );
        })}
      </defs>

      {domains.map((d, index) => {
        const pos = positions[d.slug];
        if (!pos) return null;

        const accent = domainColor(d.slug);
        const isHot = hoveredSlug === d.slug || selectedSlug === d.slug;
        const r = d.active ? ACTIVE_RADIUS : COMING_RADIUS;
        const ringR = r + 7;

        const handleKey = (event: KeyboardEvent<SVGGElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(d.slug);
          }
        };

        const labelClass = d.active ? 'domain-active' : 'domain-coming';

        return (
          <g
            key={d.slug}
            transform={`translate(${pos.x} ${pos.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${d.name} — ${d.active ? 'Active' : 'Coming Soon'}`}
            aria-pressed={selectedSlug === d.slug}
            data-slug={d.slug}
            data-state={labelClass}
            style={{
              cursor: 'pointer',
              outline: 'none',
              opacity: d.active ? 1 : 0.6,
              transition: 'opacity 150ms ease',
            }}
            onPointerEnter={() => onHover(d.slug)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(d.slug)}
            onBlur={() => onHover(null)}
            onKeyDown={handleKey}
          >
            {/* Bloom halo — the orb's luminance. Breathes when active;
                intensifies when hot. Light theme dampens it to a soft
                color shadow (module CSS). */}
            <circle
              r={r * 2.6}
              fill={`url(#lcg-bloom-${d.slug})`}
              className={`${styles.bloom} ${d.active ? styles.bloomBreath : ''}`}
              data-hot={isHot ? 'true' : undefined}
              style={
                d.active
                  ? ({
                      animationDuration: `${7 + (index % 3)}s`,
                      animationDelay: `${index * 1.3}s`,
                    } as CSSProperties)
                  : undefined
              }
            />
            {/* Hover/focus ring */}
            <circle
              r={ringR}
              fill="none"
              stroke="var(--graph-ring)"
              strokeWidth={1}
              style={{
                opacity: isHot ? 1 : 0,
                transition: 'opacity 150ms ease',
              }}
            />
            {/* Orb body — Active = luminous gradient orb; Coming Soon =
                quiet outlined disc. */}
            {d.active ? (
              <circle r={r} fill={`url(#lcg-orb-${d.slug})`} className={styles.orbCore} />
            ) : (
              <circle
                r={r}
                fill={`${accent}1f`}
                stroke={accent}
                strokeOpacity={0.55}
                strokeWidth={1}
              />
            )}
            {/* Domain name */}
            <text
              y={r + 22}
              textAnchor="middle"
              fontFamily="var(--font-space-grotesk), sans-serif"
              fontSize={13}
              fontWeight={300}
              fill="var(--text-primary)"
            >
              {d.name}
            </text>
            <text
              y={r + 40}
              textAnchor="middle"
              fontFamily="var(--font-inter), sans-serif"
              fontSize={11}
              letterSpacing="0.08em"
              fill={d.active ? 'var(--accent-cold)' : 'var(--text-secondary)'}
              style={{ textTransform: 'uppercase' }}
            >
              {d.active ? 'Active' : 'Coming Soon'}
            </text>
          </g>
        );
      })}
    </g>
  );
}
