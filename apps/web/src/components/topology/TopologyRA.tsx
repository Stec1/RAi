// TopologyRA — central RA core node for the /explore SVG topology.
// Per docs/visual-reference.md and DL-26: warm core (#fff4d6) with a
// soft halo that pulses 40% → 70% → 40% on an 8s cycle. Pure SVG, no
// three.js. Sits at world origin (0, 0); the parent <g> handles pan/zoom.

import styles from './TopologyRA.module.css';

export function TopologyRA() {
  return (
    <g aria-hidden="true">
      {/* Soft warm halo (pulsing) */}
      <circle r={56} fill="rgba(255, 210, 100, 0.12)" className={styles.haloPulse} />
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
