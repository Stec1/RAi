'use client';

// GuestIntroPanel — dismissible floating glass panel for unauthenticated
// visitors to the terminal (PATCH-PIVOT-01). Carries the tagline, the
// one-liner, and the two entry CTAs. Dismiss state lives in the parent's
// component state only — no persistence by design.

import Link from 'next/link';
import styles from './GuestIntroPanel.module.css';

interface Props {
  onDismiss: () => void;
}

export function GuestIntroPanel({ onDismiss }: Props) {
  return (
    <section className={styles.panel} aria-label="Welcome to RAI">
      <button
        type="button"
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label="Dismiss introduction"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
      <p className={styles.eyebrow}>RAI</p>
      <h2 className={styles.tagline}>Compose your world with RA.</h2>
      <p className={styles.body}>
        RAI is one universe: RA — the mind at the center — and the worlds
        people compose around it. Select a glowing node to look inside a
        world, or create your own.
      </p>
      <div className={styles.ctaRow}>
        <Link href="/signup" className={styles.ctaPrimary}>
          Get Started
        </Link>
        <Link href="/login" className={styles.ctaSecondary}>
          Log in
        </Link>
      </div>
    </section>
  );
}
