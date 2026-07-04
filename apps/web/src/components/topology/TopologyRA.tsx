// TopologyRA — central RA core node for the Explore topology.
//
// Per DL-37 (Living Intelligence Aesthetic): the core keeps its warm
// halo pulse (8s heartbeat) and additionally emits ONE soft concentric
// ring that expands outward and fades roughly every 14s — a single
// ripple, not continuous. Pure SVG at world origin (0, 0); the parent
// <g> handles pan/zoom.
//
// PATCH-PIVOT-02: RA is selectable (DL-36 — the Inspector shows an RA
// entry). Selection itself is dispatched centrally by TopologyCanvas
// from the pointerup hit-test (pointer capture retargets click events
// to the <svg> root, so per-node onClick never fires with real input);
// this node only carries the data-slug marker, hover reporting, and the
// keyboard path.

import type { KeyboardEvent } from 'react';
import styles from './TopologyRA.module.css';

interface Props {
  hot: boolean;
  onHoverChange: (hovering: boolean) => void;
  onSelect: () => void;
}

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
      {/* Heartbeat ripple (DL-37) — one ring per ~14s cycle. */}
      <circle
        r={34}
        fill="none"
        stroke="var(--accent-warm)"
        strokeWidth={1}
        className={styles.ripple}
      />
      {/* Soft warm halo (8s pulse) */}
      <circle r={56} fill="rgba(255, 210, 100, 0.12)" className={styles.haloPulse} />
      {/* Focus/hover ring */}
      <circle
        r={38}
        fill="none"
        stroke="var(--graph-ring)"
        strokeWidth={1}
        style={{ opacity: hot ? 1 : 0, transition: 'opacity 150ms ease' }}
      />
      {/* Solid core */}
      <circle r={28} fill="#fff4d6" />
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
