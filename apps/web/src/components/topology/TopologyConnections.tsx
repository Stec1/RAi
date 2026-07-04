// TopologyConnections — the RA→Domain edges beneath the nodes.
//
// Per DL-37 (Living Intelligence Aesthetic):
//   • Every edge keeps its resting hairline (--graph-line), brightening
//     to the Domain accent when that Domain is hovered or selected.
//   • ACTIVE-domain edges additionally carry a continuous, very
//     low-contrast flowing dash (stroke-dashoffset, slow) reading as a
//     live current, plus an occasional brighter "packet" dot traveling
//     RA → domain — staggered so roughly one packet is visible across
//     the whole graph at a time.
//   • Coming-soon edges stay quiet: hairline only, no flow, no packets.
//   • Hovering/selecting a domain quickens and brightens its flow.

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
  // Stagger packets across ACTIVE edges only; index within the active
  // subset keeps the ~one-visible-at-a-time rhythm stable regardless of
  // how domains are ordered in the payload.
  let activeIndex = -1;

  return (
    <g aria-hidden="true">
      {domains.map((d) => {
        const pos = positions[d.slug];
        if (!pos) return null;
        if (d.active) activeIndex += 1;

        const isHot = hoveredSlug === d.slug || selectedSlug === d.slug;
        const stroke = isHot ? domainColor(d.slug) : 'var(--graph-line)';
        const strokeOpacity = isHot ? 0.35 : 1;
        const strokeWidth = isHot ? 1.5 : 1;

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
            {d.active ? (
              <>
                {/* Live current — slow dash flow RA → domain (DL-37). */}
                <line
                  x1={0}
                  y1={0}
                  x2={pos.x}
                  y2={pos.y}
                  className={`${styles.flow} ${isHot ? styles.flowHot : ''}`}
                />
                {/* Occasional packet. 21s cycle, 7s stagger across the
                    three active edges → ≈1 visible at any moment. */}
                <circle
                  r={2.2}
                  className={styles.packet}
                  style={
                    {
                      '--sig-x': `${pos.x}px`,
                      '--sig-y': `${pos.y}px`,
                      animationDelay: `${activeIndex * 7}s`,
                    } as CSSProperties
                  }
                />
              </>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
