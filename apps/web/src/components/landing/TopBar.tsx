'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './TopBar.module.css';

// Transparent / light-glass sticky top bar.
//
// Auth-aware right-side actions (max 3 visible at any time):
//   - guest                 → "Log in" (ghost) + "Get Started" (cta)
//   - authNoObservatory     → "Explore" (ghost) + "Create Observatory" (cta)
//   - authWithObservatory   → "Explore" (ghost) + "Dashboard" (cta)
//
// Observatory state is resolved via the same-origin `/api/me` proxy
// (browser cookies stay first-party; see apps/web/next.config.mjs).
// Until BOTH the session and the observatory state resolve, we render
// the guest variant. This is the safe default — it avoids hydration
// flicker and never locks a visitor out of sign-in.

type AuthState = 'guest' | 'authNoObservatory' | 'authWithObservatory';

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();
  const [observatoryResolved, setObservatoryResolved] = useState<
    'unresolved' | 'none' | 'present'
  >('unresolved');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Resolve observatory state once the session is known. We only call
  // /api/me when there's actually a user — avoids unnecessary 401s for
  // guest visitors and keeps the request count low on the public bar.
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setObservatoryResolved('unresolved');
      return;
    }
    const controller = new AbortController();
    fetch('/api/me', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: { observatory: { id: string; name: string } | null } | null) => {
        if (!data) {
          // Treat unknown shape / non-OK as unresolved — TopBar falls
          // back to the guest variant rather than locking the user out.
          setObservatoryResolved('unresolved');
          return;
        }
        setObservatoryResolved(data.observatory === null ? 'none' : 'present');
      })
      .catch(() => {
        setObservatoryResolved('unresolved');
      });
    return () => controller.abort();
  }, [isLoading, user]);

  // Hydration guard: SSR has no session, so first paint MUST match the
  // guest variant. We only switch to an authenticated variant once both
  // useAuth and the observatory fetch have resolved.
  const authState: AuthState =
    !isLoading && user && observatoryResolved !== 'unresolved'
      ? observatoryResolved === 'none'
        ? 'authNoObservatory'
        : 'authWithObservatory'
      : 'guest';

  return (
    <header className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/about" className={styles.logo} aria-label="RAi — About">
          RAi
        </Link>
        <nav className={styles.actions}>
          {authState === 'guest' ? (
            <>
              <Link href="/login" className={styles.link}>
                Log in
              </Link>
              <Link href="/signup" className={styles.cta}>
                Get Started
              </Link>
            </>
          ) : authState === 'authNoObservatory' ? (
            <>
              <Link href="/explore" className={styles.link}>
                Explore
              </Link>
              <Link href="/create" className={styles.cta}>
                Create Observatory
              </Link>
            </>
          ) : (
            <>
              <Link href="/explore" className={styles.link}>
                Explore
              </Link>
              <Link href="/dashboard" className={styles.cta}>
                Dashboard
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
