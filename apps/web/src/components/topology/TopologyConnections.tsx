// TopologyConnections — luminous curved RA→Domain edges (Living Crystal
// Graph, DL-37 amended).
//
//   • Every edge: a thin, gently curved quadratic bezier with a
//     white→identity-color gradient stroke (userSpaceOnUse so the
//     gradient runs hub → node); resting subtle, hot brighter.
//   • ACTIVE edges additionally carry a continuous low-contrast flow
//     (stroke-dashoffset along the curve) plus an occasional brighter
//     packet traveling the same path (CSS offset-path), staggered so
//     ≈1 packet is visible across the graph at a time.
//   • Coming-soon edges stay quiet: gradient hairline only.
//   • Hover/selection brightens the edge and quickens its flow.
//
// Edge→node relationships, hover/selection inputs, and stagger rhythm
// are unchanged from PATCH-PIVOT-02 — only the rendering changed.

import type { CSSProperties } from 'react';
import type { DomainSeed, Vec2 } from './topology-layout';
import { curvedEdgePath, domainColor } from './topology-layout';
import styles from './TopologyConnections.module.css';

interface Props {
  domains: DomainSeed[];
  positions: Record<string, Vec2>;
  hoveredSlug: string | null;
  selectedSlug: string | null;
}

const ORIGIN: Vec2 = { x: 0, y: 0 };

export function TopologyConnections({
  domains,
  positions,
  hoveredSlug,
  selectedSlug,
}: Props) {
  let activeIndex = -1;

  return (
    <g aria-hidden="true">
      <defs>
        {domains.map((d) => {
          const pos = positions[d.slug];
          if (!pos) return null;
          return (
            <linearGradient
              key={`edge-grad-${d.slug}`}
              id={`lcg-edge-${d.slug}`}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={pos.x}
              y2={pos.y}
            >
              <stop offset="0%" style={{ stopColor: 'var(--graph-edge-base)' }} />
              <stop offset="100%" stopColor={domainColor(d.slug)} stopOpacity={0.85} />
            </linearGradient>
          );
        })}
      </defs>

      {domains.map((d, index) => {
        const pos = positions[d.slug];
        if (!pos) return null;
        if (d.active) activeIndex += 1;

        const isHot = hoveredSlug === d.slug || selectedSlug === d.slug;
        const path = curvedEdgePath(ORIGIN, pos, index);

        return (
          <g key={d.slug}>
            <path
              d={path}
              fill="none"
              stroke={`url(#lcg-edge-${d.slug})`}
              className={`${styles.edge} ${d.active ? styles.edgeActive : styles.edgeComing}`}
              data-hot={isHot ? 'true' : undefined}
            />
            {d.active ? (
              <>
                {/* Live current — slow dash flow along the curve. */}
                <path
                  d={path}
                  fill="none"
                  className={`${styles.flow} ${isHot ? styles.flowHot : ''}`}
                />
                {/* Occasional packet traveling the same curve. 21s
                    cycle, 7s stagger across three active edges. */}
                <circle
                  r={2.2}
                  className={styles.packet}
                  style={
                    {
                      offsetPath: `path('${path}')`,
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
