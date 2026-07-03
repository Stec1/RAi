'use client';

// RaiTerminal — the one-page frame for the RAI universe (PATCH-PIVOT-01,
// DL-31/DL-32). Rendered by both `/` and `/explore`; the route split is
// preserved only for existing redirects and TopBar links.
//
// Frame: terminal header (DL-28 roles + theme toggle) · universe canvas ·
// mono status line. Floating over the canvas: the auth-aware info panel
// (DL-26 CTAs unchanged) and, for guests, a dismissible intro panel.
// Observatory nodes open the full-screen art-story overlay in place.
//
// This component absorbed the orchestration that previously lived in
// ExploreClient (ISSUE-08R):
//   1. Fetches the 7 Domains from the same-origin proxy `/api/v1/domains`.
//      Direct cross-origin calls to Railway are forbidden — production
//      auth depends on the same-origin proxy.
//   2. Resolves the visitor's auth state via useAuth + `/api/me` once for
//      the whole terminal (header, info panel, guest intro).
//   3. Owns hover/select state for the topology and panel.
//   4. Locks document-level scroll while mounted (one-pager; trackpad
//      pinch/inertia must never scroll the page under the canvas).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopologyCanvas } from '../topology/TopologyCanvas';
import { ExploreInfoPanel } from '../topology/ExploreInfoPanel';
import type { AuthState } from '../topology/ExploreInfoPanel';
import type { DomainSeed } from '../topology/topology-layout';
import type { DomainDTO } from '../../lib/topology-types';
import { MOCK_OBSERVATORIES } from '../../data/mock-observatories';
import { useAuth } from '../../hooks/useAuth';
import { TerminalHeader, type HeaderVariant } from './TerminalHeader';
import { ArtStoryOverlay } from './ArtStoryOverlay';
import { GuestIntroPanel } from './GuestIntroPanel';
import styles from './RaiTerminal.module.css';

interface DomainsResponse {
  domains: DomainDTO[];
}

function isDomainsResponse(value: unknown): value is DomainsResponse {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as { domains?: unknown };
  return Array.isArray(maybe.domains);
}

// Same-origin paths — the Next.js rewrite (apps/web/next.config.mjs)
// proxies `/api/*` to the upstream API. We must NOT use absolute Railway
// URLs or NEXT_PUBLIC_API_URL here; production auth depends on cookies
// staying first-party on the web origin.
const DOMAINS_PATH = '/api/v1/domains';
const ME_PATH = '/api/me';

function toSeeds(domains: DomainDTO[]): DomainSeed[] {
  return domains.map((d) => ({
    slug: d.slug,
    name: d.name,
    active: d.active,
    positionX: d.positionX,
    positionY: d.positionY,
    theme: d.theme,
    description: d.description,
  }));
}

export function RaiTerminal() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();

  const [domains, setDomains] = useState<DomainSeed[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>('unknown');
  const [introDismissed, setIntroDismissed] = useState(false);
  const [openStorySlug, setOpenStorySlug] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Lock document-level scroll while the terminal is mounted. Styles are
  // set imperatively (not via a global class) because Next.js's CSS
  // Modules pipeline rejects bare top-level :global selectors. Previous
  // values are saved and restored on unmount so navigating away leaves
  // the document in its original state.
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overscrollBehavior = prevBodyOverscroll;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // Fetch domains via same-origin proxy.
  useEffect(() => {
    const controller = new AbortController();
    fetch(DOMAINS_PATH, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} from ${DOMAINS_PATH}`);
        const json: unknown = await res.json();
        if (!isDomainsResponse(json)) {
          throw new Error('Unexpected response shape from /api/v1/domains');
        }
        return json.domains;
      })
      .then((list) => setDomains(toSeeds(list)))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('[terminal] failed to load the universe:', err);
        }
        setError('Could not load the universe. Check API connection.');
      });
    return () => controller.abort();
  }, []);

  // Resolve auth state. While the session is loading, we keep 'unknown'
  // so every consumer renders the safe-default (guest) variant. Any
  // error path ultimately falls back to 'guest' — never blocks the user.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAuthState('guest');
      return;
    }
    const controller = new AbortController();
    fetch(ME_PATH, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: { observatory: { id: string; name: string } | null } | null) => {
        if (!data) {
          setAuthState('guest');
          return;
        }
        setAuthState(
          data.observatory === null ? 'authNoObservatory' : 'authWithObservatory',
        );
      })
      .catch(() => setAuthState('guest'));
    return () => controller.abort();
  }, [authLoading, user]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      // Hard navigation to `/` so any client cache is rebuilt and
      // /api/me is re-resolved with no cookie.
      router.replace('/');
      setSigningOut(false);
    }
  }

  // Hydration guard (DL-28): SSR has no session, so first paint renders
  // the guest header. 'unknown' maps to guest until auth resolves.
  const headerVariant: HeaderVariant =
    authState === 'unknown' ? 'guest' : authState;

  const focusedSlug = selectedSlug ?? hoveredSlug;
  const showIntro = authState === 'guest' && !introDismissed;

  const openStory = openStorySlug
    ? MOCK_OBSERVATORIES.find((o) => o.slug === openStorySlug) ?? null
    : null;
  const openStoryDomainName = openStory
    ? domains?.find((d) => d.slug === openStory.domainSlug)?.name
    : undefined;

  const statusCounts = domains
    ? `${domains.length} domains · ${MOCK_OBSERVATORIES.length} observatories`
    : 'connecting…';

  return (
    <div className={styles.terminal}>
      <TerminalHeader
        variant={headerVariant}
        signingOut={signingOut}
        onSignOut={handleSignOut}
      />

      <main className={styles.universe} aria-labelledby="terminal-heading">
        <h1 id="terminal-heading" className={styles.srOnly}>
          RAI — a universe of observatories
        </h1>

        {/* The canvas host owns all wheel/touch gestures; panels float
            above it and keep their own pointer behavior. */}
        <div className={styles.canvasHost}>
          {error ? (
            <p className={styles.status}>{error}</p>
          ) : !domains ? (
            <p className={styles.status}>Loading…</p>
          ) : (
            <TopologyCanvas
              domains={domains}
              observatories={MOCK_OBSERVATORIES}
              hoveredSlug={hoveredSlug}
              selectedSlug={selectedSlug}
              onHover={setHoveredSlug}
              onSelect={(slug) =>
                setSelectedSlug((prev) => (prev === slug ? null : slug))
              }
              onClearSelect={() => setSelectedSlug(null)}
              onOpenObservatory={setOpenStorySlug}
            />
          )}
        </div>

        <div className={styles.sidePanel}>
          {domains ? (
            <ExploreInfoPanel
              domains={domains}
              selectedDomainSlug={focusedSlug}
              authState={authState}
            />
          ) : null}
        </div>

        {showIntro ? (
          <GuestIntroPanel onDismiss={() => setIntroDismissed(true)} />
        ) : null}
      </main>

      <footer className={styles.statusLine} aria-label="Universe status">
        <span>{`RAI · virtual universe · ${statusCounts}`}</span>
        <span className={styles.hintDesktop}>drag to move · scroll to zoom</span>
        <span className={styles.hintMobile}>drag to move · pinch to zoom</span>
      </footer>

      {openStory ? (
        <ArtStoryOverlay
          observatory={openStory}
          domainName={openStoryDomainName}
          onClose={() => setOpenStorySlug(null)}
        />
      ) : null}
    </div>
  );
}
