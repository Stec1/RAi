// TopologyDomains — renders the 7 Domain nodes around RA as pure SVG.
//
// Per DL-26 and docs/visual-reference.md:
//   • Active Domains: filled disc in the Domain accent color, hairline
//     ring on top for crisp definition. Brighter, ~16px radius.
//   • Coming Soon Domains: outlined disc (low-alpha fill, 1px stroke),
//     wrapped in a softened parent <g opacity={0.55}> so labels dim too.
//   • Hover or selection draws an outer fade-in ring (150ms transition).
//   • Each <g> is keyboard reachable; Enter/Space selects the Domain.
//
// PATCH-PIVOT-01 (DL-33): each node carries a soft breathing halo in its
// accent color, staggered per node. Chrome colors (rings, outlines) come
// from --graph-* tokens so both themes read correctly; the accent colors
// themselves are identity and never flip.

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

const ACTIVE_RADIUS = 16;
const COMING_RADIUS = 12;

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
      {domains.map((d, index) => {
        const pos = positions[d.slug];
        if (!pos) return null;

        const accent = domainColor(d.slug);
        const isHot = hoveredSlug === d.slug || selectedSlug === d.slug;
        const r = d.active ? ACTIVE_RADIUS : COMING_RADIUS;
        // Outer focus/hover ring sits 6px outside the node radius.
        const ringR = r + 6;

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
              opacity: d.active ? 1 : 0.55,
              transition: 'opacity 150ms ease',
            }}
            onPointerEnter={() => onHover(d.slug)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(d.slug)}
            onBlur={() => onHover(null)}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(d.slug);
            }}
            onKeyDown={handleKey}
          >
            {/* Breathing halo (DL-33) — staggered per node so the field
                never pulses in unison. Sits under the node body. */}
            <circle
              r={r + 12}
              fill={accent}
              className={styles.breathHalo}
              style={
                {
                  animationDuration: `${7 + (index % 3)}s`,
                  animationDelay: `${index * 1.1}s`,
                } as CSSProperties
              }
            />
            {/* Hover/focus ring. Always rendered; opacity transitions in. */}
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
            {/* Node body — Active = filled, Coming Soon = outlined */}
            {d.active ? (
              <>
                <circle r={r} fill={accent} />
                <circle
                  r={r}
                  fill="none"
                  stroke="var(--graph-node-outline)"
                  strokeWidth={1}
                />
              </>
            ) : (
              <circle
                r={r}
                fill={`${accent}14`}
                stroke={accent}
                strokeOpacity={0.5}
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
            {/* Status caption — Active uses accent-cold; Coming Soon uses
                muted text-secondary. The parent <g> opacity dampens the
                Coming Soon labels by design (no override). */}
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
