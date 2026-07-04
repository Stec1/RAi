'use client';

// TerminalHeader — the terminal's command strip (DL-32/DL-36).
// Wordmark (→ `/`), context label, live readouts computed from real
// fetched data (never hardcoded), the ThemeToggle, and the DL-28
// auth-aware navigation — same destinations as the TopBar, terminal
// styling:
//
//   guest               → About · Log in · Get Started
//   authNoObservatory   → Explore · About · Sign out
//   authWithObservatory → Explore · Dashboard · Sign out
//
// The ThemeToggle and readouts are chrome, not navigation actions, so
// the 3-element action discipline holds.

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
  /** e.g. "EXPLORE · VIRTUAL UNIVERSE" */
  contextLabel: string;
  /** Live readouts derived from fetched data; null while connecting. */
  readouts: string | null;
}

export function TerminalHeader({
  variant,
  signingOut,
  onSignOut,
  contextLabel,
  readouts,
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.wordmark} aria-label="RAI — Home">
          RAI
        </Link>
        <span className={styles.context} aria-hidden="true">
          {contextLabel}
        </span>
      </div>
      <div className={styles.right}>
        <span className={styles.readouts}>{readouts ?? 'connecting…'}</span>
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
