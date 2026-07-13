'use client';

// ActivityStrip — the terminal's bottom activity log (DL-36).
//
// MOCK DATA: the event list below is a fixed sample so the strip has a
// voice before any real feed exists. It cycles slowly (CSS-only) and
// must NOT imply a real-time backend — no timestamps, no counters that
// tick. REMOVE the constants when a real activity source lands.
//
// Desktop: a single quiet mono strip cycling one entry at a time.
// Mobile (the terminal's bottom-sheet Activity tab): the same entries
// as a static stacked list. Reduced motion: cycling freezes on the
// first entry.

import styles from './ActivityStrip.module.css';

export const MOCK_ACTIVITY: string[] = [
  'wawel — the dragon stirs',
  'signal garden — night bloom',
  'ra — heartbeat steady',
  'universe — flow nominal',
];

export function ActivityStrip() {
  const cycleDuration = MOCK_ACTIVITY.length * 4; // 4s per entry
  return (
    <footer className={styles.strip} aria-label="Sample activity">
      <span className={styles.label}>Activity</span>
      <span className={styles.entries} aria-hidden="true">
        {MOCK_ACTIVITY.map((entry, i) => (
          <span
            key={entry}
            className={styles.entry}
            style={{
              animationDuration: `${cycleDuration}s`,
              animationDelay: `${i * 4}s`,
            }}
          >
            {entry}
          </span>
        ))}
      </span>
    </footer>
  );
}

// Static list rendering for the mobile Activity tab.
export function ActivityList() {
  return (
    <ul className={styles.list} aria-label="Sample activity">
      {MOCK_ACTIVITY.map((entry) => (
        <li key={entry} className={styles.listItem}>
          {entry}
        </li>
      ))}
    </ul>
  );
}
