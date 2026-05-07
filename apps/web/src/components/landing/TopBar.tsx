'use client';

// TopBar — canonical app-wide navigation chrome.
//
// Per DL-28 (TopBar Canonical Roles): the bar is navigation, not the
// surface for a primary CTA. The RAi logo always routes to `/`. The
// right-side actions are auth-aware and respect the 3-element
// discipline from docs/visual-reference.md.
//
//   guest               → About · Log in · Get Started
//   authNoObservatory   → Explore · About · Sign out
//   authWithObservatory → Explore · Dashboard · Sign out
//
// Primary CTA "Create Observatory" lives in ExploreInfoPanel and on
// /create — not in this bar (DL-28 §1).
//
// Auth state is resolved with useAuth() + a same-origin /api/me call.
// Hydration-safe: first paint and any unresolved/loading state render
// the guest variant.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './TopBar.module.css';

type Variant = 'guest' | 'authNoObservatory' | 'authWithObservatory';

export function TopBar() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [observatoryResolved, setObservatoryResolved] = useState<{
    hasObservatory: boolean;
  } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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
      setObservatoryResolved(null);
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
          setObservatoryResolved(null);
          return;
        }
        setObservatoryResolved({ hasObservatory: data.observatory !== null });
      })
      .catch(() => {
        setObservatoryResolved(null);
      });
    return () => controller.abort();
  }, [isLoading, user]);

  // Hydration guard: SSR has no session, so first paint MUST match the
  // guest variant. We only switch to an authenticated variant once both
  // useAuth and the observatory fetch have resolved.
  const variant: Variant =
    isLoading || !user || !observatoryResolved
      ? 'guest'
      : observatoryResolved.hasObservatory
        ? 'authWithObservatory'
        : 'authNoObservatory';

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      // Hard navigation to `/` so any client cache is rebuilt and
      // /api/me is re-resolved with no cookie.
      router.replace('/');
    }
  }

  return (
    <header className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="RAi — Home">
          RAi
        </Link>
        <nav className={styles.actions} aria-label="Primary">
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
                onClick={handleSignOut}
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
                onClick={handleSignOut}
                disabled={signingOut}
                className={styles.link}
              >
                Sign out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
