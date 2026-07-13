'use client';

// RegistryRail — the terminal's left rail (DL-36; worlds-only since
// GENESIS R-01): every world on the topology, reachable as a list.
// Hovering a row highlights the matching graph node; clicking a row
// selects it into the Inspector — the same selection model as clicking
// the node itself. The rail itself is v1 chrome and is demolished at
// R-03 (kill-map W-04).

import type { EntityRef, World } from '../../lib/topology-types';
import styles from './RegistryRail.module.css';

interface Props {
  worlds: World[];
  hovered: EntityRef | null;
  selected: EntityRef | null;
  onHover: (ref: EntityRef | null) => void;
  onSelect: (ref: EntityRef) => void;
}

function refMatches(ref: EntityRef | null, target: EntityRef): boolean {
  if (!ref) return false;
  if (ref.kind !== target.kind) return false;
  if (ref.kind === 'ra') return true;
  return (
    'slug' in target && (ref as { slug: string }).slug === target.slug
  );
}

export function RegistryRail({
  worlds,
  hovered,
  selected,
  onHover,
  onSelect,
}: Props) {
  const row = (
    target: EntityRef,
    key: string,
    marker: React.ReactNode,
    name: string,
  ) => {
    const isHot = refMatches(hovered, target) || refMatches(selected, target);
    return (
      <button
        key={key}
        type="button"
        className={styles.row}
        data-hot={isHot ? 'true' : undefined}
        aria-pressed={refMatches(selected, target)}
        onPointerEnter={() => onHover(target)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(target)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(target)}
      >
        {marker}
        <span className={styles.rowName}>{name}</span>
      </button>
    );
  };

  return (
    <nav className={styles.rail} aria-label="Registry">
      <p className={styles.railHeader}>Registry</p>

      <p className={styles.sectionLabel}>Worlds</p>
      <div className={styles.section}>
        {worlds.length === 0 ? (
          <p className={styles.rowName}>No public worlds yet.</p>
        ) : (
          worlds.map((w) =>
            row(
              { kind: 'observatory', slug: w.slug },
              `world-${w.slug}`,
              <span
                className={styles.dot}
                style={{ background: w.signature.primaryColor }}
                aria-hidden="true"
              />,
              w.title,
            ),
          )
        )}
      </div>
    </nav>
  );
}
