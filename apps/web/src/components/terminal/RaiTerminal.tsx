'use client';

// RaiTerminal — the Explore information terminal (DL-31/DL-32/DL-36;
// data model rewired at GENESIS R-01: one universe, RA + worlds).
// Rendered by both `/` and `/explore`; the route split is preserved only
// for existing redirects and TopBar links.
//
// Desktop frame: command strip · [Registry rail | framed Topology panel |
// docked Inspector] · Activity strip. This v1 chrome REMAINS until the
// full-screen meta-graph lands at R-03 (kill-map W-03…W-08) — R-01 only
// rewired its data: the universe is 100% real (RA + PUBLIC worlds from
// `GET /api/v1/observatories`); the demo-mock merge and the domain layer
// are gone. On API failure the terminal shows its composed error state —
// there is no mock fallback anymore.
//
// Selection model (PATCH-PIVOT-02): one EntityRef drives everything —
// clicking a graph node or a Registry row selects the entity into the
// Inspector; hovering either surface highlights the node. The art-story
// overlay opens ONLY from the Inspector's `Open art-story` button; its
// content is fetched on open from `GET /api/v1/observatories/by-name/:name`
// (the graph list intentionally carries no content).
//
// Auth state resolves once via useAuth + `/api/me` for the whole terminal
// (header, Inspector CTA, guest intro). Document-level scroll stays
// locked while mounted (one-pager).

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { ContentBlock, EntityRef, ViewCommand, World } from '../../lib/topology-types';
import { ExploreInfoPanel } from '../topology/ExploreInfoPanel';
import type { AuthState } from '../topology/ExploreInfoPanel';
import {
  contentToStoryBlocks,
  toWorld,
  type ObservatoryDTO,
} from '../../lib/universe-observatories';
import type { StoryBlock } from '../observatory/ObservatoryStory';
import { useAuth } from '../../hooks/useAuth';
import { TerminalHeader, type HeaderVariant } from './TerminalHeader';
import { ArtStoryOverlay } from './ArtStoryOverlay';
import { GuestIntroPanel } from './GuestIntroPanel';
import { RegistryRail } from './RegistryRail';
import { ActivityStrip, ActivityList } from './ActivityStrip';
import styles from './RaiTerminal.module.css';

// The WebGL 3D graph (DL-43) is client-only and code-split: it must
// never run during SSR and must not weigh on non-Explore routes.
const TopologyGraph3D = dynamic(() => import('../topology/TopologyGraph3D'), {
  ssr: false,
  loading: () => <p className={styles.status}>Preparing the universe…</p>,
});

// Same-origin paths — the Next.js rewrite (apps/web/next.config.mjs)
// proxies `/api/*` to the upstream API. We must NOT use absolute Railway
// URLs here; production auth depends on cookies staying first-party.
const OBSERVATORIES_PATH = '/api/v1/observatories';
const ME_PATH = '/api/me';

function isObservatoriesResponse(
  value: unknown,
): value is { observatories: ObservatoryDTO[] } {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as { observatories?: unknown };
  return Array.isArray(maybe.observatories);
}

function refEquals(a: EntityRef | null, b: EntityRef | null): boolean {
  if (!a || !b) return a === b;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'ra') return true;
  return (a as { slug: string }).slug === (b as { slug: string }).slug;
}

type SheetTab = 'registry' | 'inspector' | 'activity';

// Overlay content lifecycle: fetched on open (see header comment).
type StoryContent =
  | { state: 'loading' }
  | { state: 'ready'; blocks: StoryBlock[]; tagline: string }
  | { state: 'error' };

export function RaiTerminal() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();

  // The universe: PUBLIC worlds from the graph list. null = loading.
  const [worlds, setWorlds] = useState<World[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<EntityRef | null>(null);
  const [selected, setSelected] = useState<EntityRef | null>(null);
  const [openStorySlug, setOpenStorySlug] = useState<string | null>(null);
  const [storyContent, setStoryContent] = useState<StoryContent | null>(null);
  const [authState, setAuthState] = useState<AuthState>('unknown');
  const [introDismissed, setIntroDismissed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<SheetTab>('inspector');
  const [autoRotate, setAutoRotate] = useState(true);
  // Real view actions for the pill controls (DL-37: controls are real).
  const [viewCommand, setViewCommand] = useState<ViewCommand>({
    action: 'reset',
    token: 0,
  });

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

  // Fetch the universe (public worlds) via the same-origin proxy. This is
  // the terminal's ONE data dependency — failure shows the composed error
  // state (no mock fallback since R-01).
  useEffect(() => {
    const controller = new AbortController();
    fetch(OBSERVATORIES_PATH, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} from ${OBSERVATORIES_PATH}`);
        const json: unknown = await res.json();
        if (!isObservatoriesResponse(json)) {
          throw new Error('Unexpected response shape from /api/v1/observatories');
        }
        return json.observatories;
      })
      .then((list) => setWorlds(list.map(toWorld)))
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

  // Overlay content: fetched when a story opens. Public worlds always
  // resolve (the slug came from the public graph list).
  useEffect(() => {
    if (!openStorySlug) {
      setStoryContent(null);
      return;
    }
    setStoryContent({ state: 'loading' });
    const controller = new AbortController();
    fetch(`${OBSERVATORIES_PATH}/by-name/${encodeURIComponent(openStorySlug)}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then(
        (data: {
          observatory?: { content: ContentBlock[] | null; bio: string | null };
        } | null) => {
          if (!data?.observatory) {
            setStoryContent({ state: 'error' });
            return;
          }
          setStoryContent({
            state: 'ready',
            blocks: contentToStoryBlocks(data.observatory.content),
            tagline: data.observatory.bio ?? '',
          });
        },
      )
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStoryContent({ state: 'error' });
      });
    return () => controller.abort();
  }, [openStorySlug]);

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

  const openStory = useMemo(
    () =>
      openStorySlug && worlds
        ? worlds.find((w) => w.slug === openStorySlug) ?? null
        : null,
    [openStorySlug, worlds],
  );

  const readouts = worlds
    ? `${worlds.length} world${worlds.length === 1 ? '' : 's'} · RAI universe`
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
        contextLabel="Explore · RAI Universe"
        readouts={readouts}
      />

      <div className={styles.body} data-tab={activeTab}>
        <aside className={styles.registryRegion} aria-label="Registry">
          {worlds ? (
            <RegistryRail
              worlds={worlds}
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
            RAI — a universe of worlds around RA
          </h1>
          <div className={styles.topologyPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Topology</span>
              <span className={styles.zoomControl}>
                <span>3D</span>
              </span>
            </div>
            <div className={styles.canvasHost}>
              {error ? (
                <p className={styles.status}>{error}</p>
              ) : !worlds ? (
                <p className={styles.status}>Loading…</p>
              ) : (
                <TopologyGraph3D
                  worlds={worlds}
                  hovered={hovered}
                  selected={selected}
                  onHoverEntity={setHovered}
                  onSelectEntity={handleSelect}
                  onClearSelect={() => setSelected(null)}
                  viewCommand={viewCommand}
                  autoRotate={autoRotate}
                />
              )}
              {/* View pill controls (DL-37: real actions only). Bottom-
                  right, clear of the guest intro at bottom-left. */}
              {worlds ? (
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
                    aria-pressed={autoRotate}
                    data-active={autoRotate ? 'true' : undefined}
                    onClick={() => setAutoRotate((v) => !v)}
                  >
                    Rotate
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
          {worlds ? (
            <ExploreInfoPanel
              focus={focus}
              worlds={worlds}
              authState={authState}
              onOpenStory={setOpenStorySlug}
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
          world={openStory}
          tagline={
            storyContent?.state === 'ready' && storyContent.tagline
              ? storyContent.tagline
              : openStory.tagline
          }
          blocks={storyContent?.state === 'ready' ? storyContent.blocks : null}
          loadFailed={storyContent?.state === 'error'}
          onClose={() => setOpenStorySlug(null)}
        />
      ) : null}
    </div>
  );
}
