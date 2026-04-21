import type { CSSProperties } from 'react';
import styles from './DomainShowcaseSection.module.css';
import { Reveal } from './Reveal';

// Data is hard-coded from docs/domain-definitions.md — no API calls.
// Domain colors appear only as identification accents (thin marker / dot),
// never as UI chrome.

type Active = {
  name: string;
  slug: 'nexum' | 'keth' | 'solum';
  body: string;
};

type ComingSoon = {
  name: string;
  slug: 'vorda' | 'lyren' | 'auren' | 'draxis';
};

const active: Active[] = [
  {
    name: 'Nexum',
    slug: 'nexum',
    body: 'Coordination, routing, and system orchestration.',
  },
  {
    name: 'Keth',
    slug: 'keth',
    body: 'Analysis, evaluation, and decision support.',
  },
  {
    name: 'Solum',
    slug: 'solum',
    body: 'Grounded execution, delivery, and applied workflows.',
  },
];

const coming: ComingSoon[] = [
  { name: 'Vorda', slug: 'vorda' },
  { name: 'Lyren', slug: 'lyren' },
  { name: 'Auren', slug: 'auren' },
  { name: 'Draxis', slug: 'draxis' },
];

export function DomainShowcaseSection() {
  return (
    <section className={styles.section} aria-labelledby="domains-heading">
      <Reveal className={styles.inner} as="div">
        <div className={styles.header}>
          <p id="domains-heading" className={styles.label}>
            Active domains
          </p>
          <p className={styles.intro}>
            RAi begins with three active domains and four more prepared for expansion.
          </p>
        </div>

        <div className={styles.activeGrid}>
          {active.map((d) => (
            <article
              key={d.slug}
              className={styles.card}
              style={{ '--marker-color': `var(--domain-${d.slug})` } as CSSProperties}
            >
              <span className={styles.marker} aria-hidden="true" />
              <h3 className={styles.cardName}>{d.name}</h3>
              <p className={styles.cardBody}>{d.body}</p>
            </article>
          ))}
        </div>

        <p className={styles.soonLabel}>Coming Soon</p>
        <ul className={styles.soonRow}>
          {coming.map((d) => (
            <li
              key={d.slug}
              className={styles.soonChip}
              style={{ '--marker-color': `var(--domain-${d.slug})` } as CSSProperties}
            >
              <span className={styles.soonDot} aria-hidden="true" />
              {d.name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
