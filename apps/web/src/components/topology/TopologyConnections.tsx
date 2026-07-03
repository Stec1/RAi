// TopologyConnections — the RA→Domain lines beneath the nodes.
//
// Per docs/visual-reference.md and DL-26: connection lines are subtle
// (--graph-line, theme-aware) by default and brighten to the Domain
// accent color when that Domain is hovered or selected. Rendered before
// nodes so the lines sit visually under each circle.
//
// PATCH-PIVOT-01 (DL-33): each line occasionally carries a traveling
// "signal" — a small light dot moving from RA to the domain. Timing and
// stagger live in TopologyConnections.module.css.

import type { CSSProperties } from 'react';
import type { DomainSeed, Vec2 } from './topology-layout';
import { domainColor } from './topology-layout';
import styles from './TopologyConnections.module.css';

interface Props {
  domains: DomainSeed[];
  positions: Record<string, Vec2>;
  hoveredSlug: string | null;
  selectedSlug: string | null;
}

export function TopologyConnections({
  domains,
  positions,
  hoveredSlug,
  selectedSlug,
}: Props) {
  return (
    <g aria-hidden="true">
      {domains.map((d, index) => {
        const pos = positions[d.slug];
        if (!pos) return null;
        const isActiveLink =
          hoveredSlug === d.slug || selectedSlug === d.slug;
        // Resting line: 1px hairline, very low alpha. Active link:
        // 1.5px in the Domain color at modest alpha — enough to read
        // as "lit" without competing with the nodes.
        const stroke = isActiveLink
          ? domainColor(d.slug)
          : 'var(--graph-line)';
        const strokeOpacity = isActiveLink ? 0.35 : 1;
        const strokeWidth = isActiveLink ? 1.5 : 1;
        return (
          <g key={d.slug}>
            <line
              x1={0}
              y1={0}
              x2={pos.x}
              y2={pos.y}
              stroke={stroke}
              strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth}
              style={{ transition: 'stroke 150ms ease, stroke-width 150ms ease' }}
            />
            {/* Traveling signal dot (DL-33). The keyframes translate it
                from RA (0,0) to the line's endpoint via --sig-x/--sig-y. */}
            <circle
              r={2.2}
              className={styles.signal}
              style={
                {
                  '--sig-x': `${pos.x}px`,
                  '--sig-y': `${pos.y}px`,
                  animationDelay: `${index * 2.7}s`,
                } as CSSProperties
              }
            />
          </g>
        );
      })}
    </g>
  );
}
