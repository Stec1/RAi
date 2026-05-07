'use client';

// ExploreClient — top-level client orchestrator for /explore.
//
// Per DL-26: /explore is the primary post-auth surface for users
// without an Observatory and is publicly browsable. This client:
//   1. Fetches the 7 Domains from the same-origin proxy `/api/v1/domains`.
//      Direct cross-origin calls to Railway are forbidden — production
//      auth depends on the same-origin proxy.
//   2. Resolves the visitor's auth state via useAuth + `/api/me` so the
//      info panel CTA can route correctly.
//   3. Owns hover/select state for the topology and panel; both surfaces
//      stay in sync (selected wins; hover is preview).
//
// No SSR fetch; the topology is a client-side experience.

import { useEffect, useState } from 'react';
import { TopologyCanvas } from '../../components/topology/TopologyCanvas';
import { ExploreInfoPanel } from '../../components/topology/ExploreInfoPanel';
import type { AuthState } from '../../components/topology/ExploreInfoPanel';
import type { DomainSeed } from '../../components/topology/topology-layout';
import type { DomainDTO } from '../../lib/topology-types';
import { useAuth } from '../../hooks/useAuth';
import styles from './page.module.css';

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

export function ExploreClient() {
  const { user, isLoading: authLoading } = useAuth();

  const [domains, setDomains] = useState<DomainSeed[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>('unknown');

  // ISSUE-08R.2: lock document-level scroll while /explore is mounted.
  // We set the styles imperatively (instead of toggling a global class)
  // because Next.js's CSS Modules pipeline rejects bare top-level
  // :global selectors, and we don't want to pollute the shared
  // globals.css for a single-route concern. Previous values are saved
  // and restored on unmount so navigating away leaves the document in
  // its original state. Combined with .page { height: 100vh; overflow:
  // hidden } in page.module.css this guarantees trackpad pinch/inertia
  // can never scroll the page under the canvas.
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
          console.error('[explore] failed to load topology:', err);
        }
        setError('Could not load the topology. Check API connection.');
      });
    return () => controller.abort();
  }, []);

  // Resolve auth state. While the session is loading, we keep
  // 'unknown' so the panel renders the safe-default (guest) CTA. Any
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

  const focusedSlug = selectedSlug ?? hoveredSlug;
  const stats = domains
    ? `${domains.length} Domains · ${domains.filter((d) => d.active).length} Active · ${domains.filter((d) => !d.active).length} Coming Soon`
    : null;

  return (
    <main className={styles.page} aria-labelledby="explore-heading">
      {/* Editorial top-left overlay. pointer-events: none on the wrapper
          keeps the canvas drag area unobstructed; child text is non-
          interactive anyway. */}
      <div className={styles.topOverlay}>
        <p className={styles.eyebrow}>Topology</p>
        <h1 id="explore-heading" className={styles.title}>
          RAi Intelligence Topology
        </h1>
        <p className={styles.subtitle}>
          RA at the center, surrounded by the seven Domains where AI
          systems publish proof of their work.
        </p>
        {stats ? <p className={styles.stats}>{stats}</p> : null}
      </div>

      <div className={styles.canvasArea}>
        {error ? (
          <p className={styles.status}>{error}</p>
        ) : !domains ? (
          <p className={styles.status}>Loading…</p>
        ) : (
          <TopologyCanvas
            domains={domains}
            hoveredSlug={hoveredSlug}
            selectedSlug={selectedSlug}
            onHover={setHoveredSlug}
            onSelect={(slug) =>
              setSelectedSlug((prev) => (prev === slug ? null : slug))
            }
            onClearSelect={() => setSelectedSlug(null)}
          />
        )}

        {/* Bottom hints live INSIDE the canvas area so they share the
            absolute-positioned coordinate space and never contribute to
            page scroll height. */}
        <p className={`${styles.bottomHint} ${styles.bottomHintDesktop}`}>
          Drag to move · Scroll to zoom
        </p>
        <p className={`${styles.bottomHint} ${styles.bottomHintMobile}`}>
          Drag to move · Pinch to zoom
        </p>
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
    </main>
  );
}
