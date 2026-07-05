'use client';

// RaiTerminal — the Explore information terminal (DL-31/DL-32/DL-36).
// Rendered by both `/` and `/explore`; the route split is preserved only
// for existing redirects and TopBar links.
//
// Desktop frame: command strip · [Registry rail | framed Topology panel |
// docked Inspector] · Activity strip. The graph is one panel among
// several, not a full-bleed canvas. Below ~1024px the Registry,
// Inspector, and Activity collapse into a tabbed bottom sheet beneath
// the topology panel.
//
// Selection model (PATCH-PIVOT-02): one EntityRef drives everything —
// clicking a graph node, a Registry row, or a Domain's mini-list row
// selects the entity into the Inspector; hovering either surface
// highlights the node and its edge. The art-story overlay opens ONLY
// from the Inspector's `Open art-story` button (see the Phase 0
// diagnosis in TopologyCanvas.tsx for why node-click-to-overlay was
// unreliable).
//
// Orchestration preserved from PATCH-PIVOT-01:
//   1. Domains come from the same-origin proxy `/api/v1/domains`.
//      Direct cross-origin calls to Railway are forbidden — production
//      auth depends on the same-origin proxy.
//   2. Auth state resolves once via useAuth + `/api/me` for the whole
//      terminal (header, Inspector CTA, guest intro).
//   3. Document-level scroll stays locked while mounted (one-pager).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TopologyCanvas,
  type EntityRef,
  type ViewCommand,
} from '../topology/TopologyCanvas';
import { ExploreInfoPanel } from '../topology/ExploreInfoPanel';
import type { AuthState } from '../topology/ExploreInfoPanel';
import type { DomainSeed } from '../topology/topology-layout';
import type { DomainDTO } from '../../lib/topology-types';
import { MOCK_OBSERVATORIES } from '../../data/mock-observatories';
import { useAuth } from '../../hooks/useAuth';
import { TerminalHeader, type HeaderVariant } from './TerminalHeader';
import { ArtStoryOverlay } from './ArtStoryOverlay';
import { GuestIntroPanel } from './GuestIntroPanel';
import { RegistryRail } from './RegistryRail';
import { ActivityStrip, ActivityList } from './ActivityStrip';
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

function refEquals(a: EntityRef | null, b: EntityRef | null): boolean {
  if (!a || !b) return a === b;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'ra') return true;
  return (a as { slug: string }).slug === (b as { slug: string }).slug;
}

type SheetTab = 'registry' | 'inspector' | 'activity';

export function RaiTerminal() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();

  const [domains, setDomains] = useState<DomainSeed[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<EntityRef | null>(null);
  const [selected, setSelected] = useState<EntityRef | null>(null);
  const [openStorySlug, setOpenStorySlug] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>('unknown');
  const [introDismissed, setIntroDismissed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetTab>('inspector');
  const [zoomPct, setZoomPct] = useState(100);
  // Real view actions for the pill controls (DL-37: controls are real).
  const [viewCommand, setViewCommand] = useState<ViewCommand>({
    action: 'reset',
    token: 0,
  });
  const [showActiveOnly, setShowActiveOnly] = useState(false);

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

  // Unified selection: same entity again toggles off; any selection
  // surfaces the Inspector tab on the mobile sheet.
  const handleSelect = (ref: EntityRef) => {
    setSelected((prev) => (refEquals(prev, ref) ? null : ref));
    setActiveTab('inspector');
  };

  // Hydration guard (DL-28): SSR has no session, so first paint renders
  // the guest header. 'unknown' maps to guest until auth resolves.
  const headerVariant: HeaderVariant =
    authState === 'unknown' ? 'guest' : authState;

  const focus = selected ?? hovered;
  const showIntro = authState === 'guest' && !introDismissed;

  const openStory = openStorySlug
    ? MOCK_OBSERVATORIES.find((o) => o.slug === openStorySlug) ?? null
    : null;
  const openStoryDomainName = openStory
    ? domains?.find((d) => d.slug === openStory.domainSlug)?.name
    : undefined;

  const readouts = domains
    ? `${domains.length} domains · ${domains.filter((d) => d.active).length} active · ${MOCK_OBSERVATORIES.length} observatories`
    : null;

  const tabs: Array<{ id: SheetTab; label: string }> = [
    { id: 'registry', label: 'Registry' },
    { id: 'inspector', label: 'Inspector' },
    { id: 'activity', label: 'Activity' },
  ];

  const dispatchView = (action: ViewCommand['action']) =>
    setViewCommand((prev) => ({ action, token: prev.token + 1 }));

  return (
    <div className={styles.terminal}>
      <TerminalHeader
        variant={headerVariant}
        signingOut={signingOut}
        onSignOut={handleSignOut}
        contextLabel="Explore · Virtual Universe"
        readouts={readouts}
      />

      <div className={styles.body} data-tab={activeTab}>
        <aside className={styles.registryRegion} aria-label="Registry">
          {domains ? (
            <RegistryRail
              domains={domains}
              observatories={MOCK_OBSERVATORIES}
              hovered={hovered}
              selected={selected}
              onHover={setHovered}
              onSelect={handleSelect}
            />
          ) : (
            <p className={styles.regionPending}>connecting…</p>
          )}
        </aside>

        <section
          className={styles.topologyRegion}
          aria-labelledby="terminal-heading"
        >
          <h1 id="terminal-heading" className={styles.srOnly}>
            RAI — a universe of observatories
          </h1>
          <div className={styles.topologyPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Topology</span>
              <span className={styles.zoomControl}>
                <span aria-live="off">{`zoom ${zoomPct}%`}</span>
              </span>
            </div>
            <div className={styles.canvasHost}>
              {error ? (
                <p className={styles.status}>{error}</p>
              ) : !domains ? (
                <p className={styles.status}>Loading…</p>
              ) : (
                <TopologyCanvas
                  domains={domains}
                  observatories={MOCK_OBSERVATORIES}
                  hovered={hovered}
                  selected={selected}
                  onHoverEntity={setHovered}
                  onSelectEntity={handleSelect}
                  onClearSelect={() => setSelected(null)}
                  onViewChange={(z) => setZoomPct(Math.round(z * 100))}
                  viewCommand={viewCommand}
                  showActiveOnly={showActiveOnly}
                />
              )}
              {/* View pill controls (DL-37: real actions only). Bottom-
                  right, clear of the guest intro at bottom-left. */}
              {domains ? (
                <div
                  className={styles.pillCluster}
                  role="group"
                  aria-label="View controls"
                >
                  <button
                    type="button"
                    className={styles.pill}
                    onClick={() => dispatchView('reset')}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className={styles.pill}
                    onClick={() => dispatchView('fit')}
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    className={styles.pill}
                    onClick={() => dispatchView('focus')}
                  >
                    Focus RA
                  </button>
                  <button
                    type="button"
                    className={styles.pill}
                    aria-pressed={showActiveOnly}
                    data-active={showActiveOnly ? 'true' : undefined}
                    onClick={() => setShowActiveOnly((v) => !v)}
                  >
                    Active only
                  </button>
                </div>
              ) : null}
              {showIntro ? (
                <GuestIntroPanel onDismiss={() => setIntroDismissed(true)} />
              ) : null}
            </div>
          </div>
        </section>

        <aside className={styles.inspectorRegion} aria-label="Inspector">
          {domains ? (
            <ExploreInfoPanel
              focus={focus}
              domains={domains}
              observatories={MOCK_OBSERVATORIES}
              authState={authState}
              onOpenStory={setOpenStorySlug}
              onSelectObservatory={(slug) =>
                handleSelect({ kind: 'observatory', slug })
              }
            />
          ) : (
            <p className={styles.regionPending}>connecting…</p>
          )}
        </aside>

        {/* Mobile-only sheet tabs; desktop shows all regions at once. */}
        <div className={styles.tabs} role="tablist" aria-label="Terminal panels">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={styles.tab}
              data-active={activeTab === tab.id ? 'true' : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.activityRegion} aria-label="Sample activity">
          <ActivityList />
        </div>
      </div>

      <div className={styles.activityStripHost}>
        <ActivityStrip />
      </div>

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
