// TopologyDepthRings — structural elliptical orbit rings behind the
// graph (DL-37 amended). Purely depth cues: no labels, no ticks, no
// data. They sit first inside the pan/zoom group and drift VERY slowly
// (minutes per revolution) to give the field life and a subtle
// spherical feel. Not decoration in the ambient-dot sense — the rings
// describe the graph's own orbital structure (domain ring radii).

import styles from './TopologyDepthRings.module.css';

export function TopologyDepthRings() {
  return (
    <g aria-hidden="true">
      <ellipse rx={340} ry={128} className={`${styles.ring} ${styles.ringA}`} />
      <ellipse rx={470} ry={182} className={`${styles.ring} ${styles.ringB}`} />
    </g>
  );
}
