// TopologyStarfield — sparse ambient point field behind the universe graph
// (PATCH-PIVOT-01, DL-33). Deterministic pseudo-random from a fixed seed so
// every visitor sees the same sky and renders never differ between mounts.
// Lives inside the pan/zoom group so the points belong to the world, not
// the viewport; ~100 tiny circles animating opacity only, which keeps
// pan/zoom cost unchanged. Colors come from --graph-point and flip with
// the theme (light points on deep canvas / graphite points on paper).

import type { CSSProperties } from 'react';
import styles from './TopologyStarfield.module.css';

// mulberry32 — tiny deterministic PRNG. Fixed seed, stable output.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 0x52414921; // "RAI!" — fixed forever so the sky is stable.
const POINT_COUNT = 96;
// Spread slightly beyond the initial viewBox (-500..500 × -400..400) so
// panning reveals sky instead of a hard edge.
const SPREAD_X = 660;
const SPREAD_Y = 540;

type Star = {
  x: number;
  y: number;
  r: number;
  duration: number;
  delay: number;
};

const STARS: Star[] = (() => {
  const rand = mulberry32(SEED);
  const out: Star[] = [];
  for (let i = 0; i < POINT_COUNT; i += 1) {
    out.push({
      x: Math.round((rand() * 2 - 1) * SPREAD_X),
      y: Math.round((rand() * 2 - 1) * SPREAD_Y),
      r: 0.6 + rand() * 1.1,
      duration: 5 + rand() * 5, // 5–10s twinkle cycles
      delay: rand() * 9,
    });
  }
  return out;
})();

export function TopologyStarfield() {
  return (
    <g aria-hidden="true">
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          className={styles.point}
          style={
            {
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </g>
  );
}
