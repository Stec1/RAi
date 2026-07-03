'use client';

// TerminalHeader — the RAI Terminal's header bar (PATCH-PIVOT-01, DL-32).
// Replaces the TopBar ON THE TERMINAL SURFACE ONLY (`/` and `/explore`);
// every other page keeps the existing TopBar. Navigation preserves the
// DL-28 canonical roles exactly — same destinations, terminal styling:
//
//   guest               → About · Log in · Get Started
//   authNoObservatory   → Explore · About · Sign out
//   authWithObservatory → Explore · Dashboard · Sign out
//
// The wordmark routes to `/` (DL-28). The ThemeToggle is chrome, not a
// navigation action, so the 3-element action discipline holds.

import Link from 'next/link';
import { ThemeToggle } from '../theme/ThemeToggle';
import styles from './TerminalHeader.module.css';

export type HeaderVariant =
  | 'guest'
  | 'authNoObservatory'
  | 'authWithObservatory';

interface Props {
  variant: HeaderVariant;
  signingOut: boolean;
  onSignOut: () => void;
}

export function TerminalHeader({ variant, signingOut, onSignOut }: Props) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark} aria-label="RAI — Home">
        RAI
      </Link>
      <div className={styles.right}>
        <nav className={styles.nav} aria-label="Primary">
          {variant === 'guest' && (
            <>
              <Link href="/about" className={styles.link}>
                About
              </Link>
              <Link href="/login" className={styles.link}>
                Log in
              </Link>
              <Link href="/signup" className={styles.cta}>
                Get Started
              </Link>
            </>
          )}
          {variant === 'authNoObservatory' && (
            <>
              <Link href="/explore" className={styles.link}>
                Explore
              </Link>
              <Link href="/about" className={styles.link}>
                About
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                className={styles.link}
              >
                Sign out
              </button>
            </>
          )}
          {variant === 'authWithObservatory' && (
            <>
              <Link href="/explore" className={styles.link}>
                Explore
              </Link>
              <Link href="/dashboard" className={styles.link}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                className={styles.link}
              >
                Sign out
              </button>
            </>
          )}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
