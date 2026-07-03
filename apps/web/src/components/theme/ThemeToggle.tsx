'use client';

// ThemeToggle — flips the [data-theme] attribute on <html> between
// 'dark' and 'light' and persists the choice to localStorage['rai-theme']
// (DL-32). Stateless on purpose: which icon is visible is driven purely
// by CSS reacting to [data-theme], so SSR markup never depends on the
// theme and hydration stays clean. The icon shows the theme you would
// switch TO (sun while dark, moon while light).

import styles from './ThemeToggle.module.css';

const STORAGE_KEY = 'rai-theme';

function flipTheme() {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage unavailable (private mode etc.) — the flip still applies
    // for this page view; it just won't persist.
  }
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={flipTheme}
      aria-label="Toggle color theme"
    >
      {/* Sun — visible in dark theme (switch to light) */}
      <svg
        className={`${styles.icon} ${styles.sun}`}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="3.2" />
        <path d="M8 0.8v2M8 13.2v2M0.8 8h2M13.2 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M13.1 2.9l-1.4 1.4M4.3 11.7l-1.4 1.4" />
      </svg>
      {/* Moon — visible in light theme (switch to dark) */}
      <svg
        className={`${styles.icon} ${styles.moon}`}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <path d="M13.4 9.6a5.8 5.8 0 1 1-7-7 4.6 4.6 0 0 0 7 7z" />
      </svg>
    </button>
  );
}
