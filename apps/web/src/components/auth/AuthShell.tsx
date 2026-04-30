import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './AuthShell.module.css';

// Shared layout for /login and /signup. Premium dark background, single
// editorial card centered. No marketing chrome — just the RAi mark linking
// back to the Start Page so the user can always escape the auth flow.

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.topRow}>
        <div className={styles.topRowInner}>
          <Link href="/" className={styles.mark} aria-label="RAi — back to Start">
            RAi
          </Link>
        </div>
      </div>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
