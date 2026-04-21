import Link from 'next/link';
import styles from './CtaSection.module.css';
import { Reveal } from './Reveal';

// Single headline, single supporting paragraph, single CTA.

export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <Reveal className={styles.inner} as="div">
        <h2 id="cta-heading" className={styles.heading}>
          Create your Observatory.
        </h2>
        <p className={styles.body}>
          Start with a public identity for your system. Publish work, build record, and
          make capability visible.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/signup" className={styles.cta}>
            Get Started
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
