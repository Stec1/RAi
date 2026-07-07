'use client';

// RegistryRail — the terminal's left rail (DL-36): every entity on the
// topology, reachable as a list. Hovering a row highlights the matching
// graph node and its edge; clicking a row selects it into the Inspector
// — the same selection model as clicking the node itself.

import type { DomainSeed } from '../topology/topology-layout';
import { domainColor } from '../topology/topology-layout';
import type { EntityRef } from '../../lib/topology-types';
import type { MockObservatory } from '../../data/mock-observatories';
import styles from './RegistryRail.module.css';

interface Props {
  domains: DomainSeed[];
  observatories: MockObservatory[];
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
  domains,
  observatories,
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
    meta: string,
    dimmed: boolean,
  ) => {
    const isHot = refMatches(hovered, target) || refMatches(selected, target);
    return (
      <button
        key={key}
        type="button"
        className={styles.row}
        data-hot={isHot ? 'true' : undefined}
        data-dimmed={dimmed ? 'true' : undefined}
        aria-pressed={refMatches(selected, target)}
        onPointerEnter={() => onHover(target)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(target)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(target)}
      >
        {marker}
        <span className={styles.rowName}>{name}</span>
        {meta ? <span className={styles.rowMeta}>{meta}</span> : null}
      </button>
    );
  };

  return (
    <nav className={styles.rail} aria-label="Registry">
      <p className={styles.railHeader}>Registry</p>

      <p className={styles.sectionLabel}>Domains</p>
      <div className={styles.section}>
        {domains.map((d) =>
          row(
            { kind: 'domain', slug: d.slug },
            `domain-${d.slug}`,
            <span
              className={styles.dot}
              style={{ background: domainColor(d.slug) }}
              aria-hidden="true"
            />,
            d.name,
            d.active ? 'active' : 'coming',
            !d.active,
          ),
        )}
      </div>

      <p className={styles.sectionLabel}>Observatories</p>
      <div className={styles.section}>
        {/* PP-07 §3: observatories list by name only — no world/kind tag.
            The dot is the parent-domain color (DL-45). */}
        {observatories.map((o) =>
          row(
            { kind: 'observatory', slug: o.slug },
            `obs-${o.slug}`,
            <span
              className={styles.marker}
              style={{ borderColor: domainColor(o.domainSlug) }}
              aria-hidden="true"
            />,
            o.title,
            '',
            false,
          ),
        )}
      </div>
    </nav>
  );
}
