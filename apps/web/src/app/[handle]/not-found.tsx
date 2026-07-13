// Calm "no such world" state for /@name (GENESIS R-01). Renders for a
// missing world, an unpublished world viewed by a non-owner (the API
// answers 404 by design — existence is not disclosed), and any non-@
// path that falls through to the dynamic segment.

import Link from 'next/link';
import styles from './page.module.css';

export default function WorldNotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.strip}>
        <Link href="/" className={styles.wordmark}>
          RAI
        </Link>
      </div>
      <div className={styles.errorState}>
        <p className={styles.errorEyebrow}>rai.app</p>
        <h1 className={styles.errorTitle}>No such world</h1>
        <p className={styles.errorBody}>
          Nothing lives at this address. It may be unpublished, or it may
          never have existed. The universe itself is at{' '}
          <Link href="/explore">rai.app/explore</Link>.
        </p>
      </div>
    </main>
  );
}
