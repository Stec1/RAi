// PageShell — full-height page frame for product surfaces (DL-29/DL-42).
import type { ReactNode } from 'react';
import styles from './glass.module.css';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.shellInner}>{children}</div>
    </div>
  );
}
