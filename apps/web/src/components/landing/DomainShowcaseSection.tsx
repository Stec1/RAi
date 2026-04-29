import styles from './DomainShowcaseSection.module.css';
import { Reveal } from './Reveal';

// Data is hard-coded from docs/domain-definitions.md — no API calls.
// Domain objects are rendered as transparent PNGs sitting directly on the
// page background. No card chrome, no glow, no badges.

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

// Per-domain scale corrections compensate for differences in the
// internal alpha-bbox of each source PNG so objects feel visually
// equal in size on screen. Source crop fills:
//   active:      keth 80.9%, nexum 80.9%, solum 82.8%  → no correction
//   coming-soon: auren 42.9%, draxis 41.9%, vorda 41.9%, lyren 35.7%
//                lyren is ~17% smaller → bump 1.18×.
const objectScale: Partial<Record<Active['slug'] | ComingSoon['slug'], string>> = {
  lyren: styles.scaleLyren,
};

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

        <div className={styles.activeRow}>
          {active.map((d) => (
            <article key={d.slug} className={styles.activeItem}>
              <div className={styles.activeObjectWrap}>
                {/* Founder spec: render source PNG directly, no compression
                    or recolor pipeline. Plain <img> is intentional. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/domain-objects/active/${d.slug}-domain-object.png`}
                  alt=""
                  className={`${styles.activeObject} ${objectScale[d.slug] ?? ''}`}
                  width={1254}
                  height={1254}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 className={styles.activeName}>{d.name}</h3>
              <p className={styles.activeBody}>{d.body}</p>
            </article>
          ))}
        </div>

        <p className={styles.soonLabel}>Coming Soon</p>
        <ul className={styles.soonRow}>
          {coming.map((d) => (
            <li key={d.slug} className={styles.soonItem}>
              <div className={styles.soonObjectWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/domain-objects/coming-soon/${d.slug}-domain-object.png`}
                  alt=""
                  className={`${styles.soonObject} ${objectScale[d.slug] ?? ''}`}
                  width={1254}
                  height={1254}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <span className={styles.soonName}>{d.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
