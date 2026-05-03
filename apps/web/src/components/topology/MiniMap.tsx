'use client';

// SVG mini-map. Read-only in ISSUE-08 — renders RA + 7 Domain dots and a
// rectangle reflecting the camera viewport in world coordinates. No click
// handlers, no labels.
//
// World space [-WORLD_HALF_EXTENT, +WORLD_HALF_EXTENT] is mapped onto the
// SVG viewBox; SVG y is flipped vs world y.

import { useTopologyViewport } from '../../hooks/useTopology';
import type { DomainDTO } from '../../lib/topology-types';
import { WORLD_HALF_EXTENT } from '../../lib/topology-utils';
import styles from './MiniMap.module.css';

const SIDE = WORLD_HALF_EXTENT * 2; // viewBox edge length

const worldToSvgX = (wx: number): number => wx + WORLD_HALF_EXTENT;
const worldToSvgY = (wy: number): number => -wy + WORLD_HALF_EXTENT;

interface Props {
  domains: DomainDTO[];
}

export function MiniMap({ domains }: Props) {
  const { cameraX, cameraY, viewportWorldWidth, viewportWorldHeight } =
    useTopologyViewport();

  // Frustum rectangle in SVG coords (world half-extents around camera).
  const rectX = worldToSvgX(cameraX - viewportWorldWidth / 2);
  const rectY = worldToSvgY(cameraY + viewportWorldHeight / 2);

  return (
    <div className={styles.minimap} aria-hidden="true">
      <svg
        viewBox={`0 0 ${SIDE} ${SIDE}`}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* RA at center */}
        <circle
          cx={WORLD_HALF_EXTENT}
          cy={WORLD_HALF_EXTENT}
          r="26"
          className={styles.ra}
        />
        {domains.map((domain) => (
          <circle
            key={domain.id}
            cx={worldToSvgX(domain.positionX)}
            cy={worldToSvgY(domain.positionY)}
            r="16"
            className={domain.active ? styles.dotActive : styles.dotComingSoon}
          />
        ))}
        <rect
          x={rectX}
          y={rectY}
          width={viewportWorldWidth}
          height={viewportWorldHeight}
          className={styles.viewport}
        />
      </svg>
    </div>
  );
}
