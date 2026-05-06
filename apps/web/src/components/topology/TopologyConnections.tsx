// TopologyConnections — the RA→Domain lines beneath the nodes.
//
// Per docs/visual-reference.md and DL-26: connection lines are subtle
// (low-alpha white) by default and brighten to the Domain accent color
// when that Domain is hovered or selected. Rendered before nodes so
// the lines sit visually under each circle.

import type { DomainSeed, Vec2 } from './topology-layout';
import { domainColor } from './topology-layout';

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
      {domains.map((d) => {
        const pos = positions[d.slug];
        if (!pos) return null;
        const isActiveLink =
          hoveredSlug === d.slug || selectedSlug === d.slug;
        // Resting line: 1px hairline, very low alpha. Active link:
        // 1.5px in the Domain color at modest alpha — enough to read
        // as "lit" without competing with the nodes.
        const stroke = isActiveLink
          ? domainColor(d.slug)
          : 'rgba(255, 255, 255, 0.06)';
        const strokeOpacity = isActiveLink ? 0.35 : 1;
        const strokeWidth = isActiveLink ? 1.5 : 1;
        return (
          <line
            key={d.slug}
            x1={0}
            y1={0}
            x2={pos.x}
            y2={pos.y}
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            style={{ transition: 'stroke 150ms ease, stroke-width 150ms ease' }}
          />
        );
      })}
    </g>
  );
}
