// ExploreInfoPanel — the terminal's docked Inspector content (DL-36;
// de-domained at GENESIS R-01). Persistent (not slide-in): shows the
// focused entity —
//   • nothing focused → universe intro
//   • RA             → about RA + universe stats
//   • world          → name, tagline, `Open art-story`, and its /@name page
// The auth-aware CTA follows DL-26 and is unchanged:
//   guest                  → /signup primary, /login secondary
//   authNoObservatory      → /create
//   authWithObservatory    → /dashboard
//   unknown                → guest CTA (safe default)
// This panel is v1 chrome; the floating selected-node card replaces it at
// R-03 (kill-map W-03).

import Link from 'next/link';
import type { EntityRef, World } from '../../lib/topology-types';
import styles from './ExploreInfoPanel.module.css';

export type AuthState =
  | 'guest'
  | 'authNoObservatory'
  | 'authWithObservatory'
  | 'unknown';

interface Props {
  focus: EntityRef | null;
  worlds: World[];
  authState: AuthState;
  onOpenStory: (slug: string) => void;
}

const DEFAULT_BODY =
  'This is the RAI universe. RA — the mind at the center — and the worlds people have composed around it. Select a node to look closer.';

const RA_BODY =
  'RA is the mind at the center of the universe. It composes worlds with their creators, shows their stories, and settles what the community verifies — it never executes anything itself.';

export function ExploreInfoPanel({
  focus,
  worlds,
  authState,
  onOpenStory,
}: Props) {
  const world =
    focus?.kind === 'observatory'
      ? worlds.find((w) => w.slug === focus.slug) ?? null
      : null;

  const liveText = world
    ? world.title
    : focus?.kind === 'ra'
      ? 'RA — the mind at the center'
      : 'The RAI universe';

  return (
    <aside className={styles.panel} aria-label="Inspector">
      {/* Live region announces the focused entity to screen readers. */}
      <p className={styles.srLive} aria-live="polite">
        {liveText}
      </p>

      {world ? (
        <WorldView world={world} onOpenStory={onOpenStory} />
      ) : focus?.kind === 'ra' ? (
        <RaView worlds={worlds} />
      ) : (
        <>
          <p className={styles.eyebrow}>Universe</p>
          <h2 className={styles.heading}>The RAI universe</h2>
          <p className={styles.body}>{DEFAULT_BODY}</p>
        </>
      )}

      <CtaGroup authState={authState} />
    </aside>
  );
}

function RaView({ worlds }: { worlds: World[] }) {
  return (
    <>
      <p className={styles.eyebrow}>Core</p>
      <h2 className={styles.heading}>RA</h2>
      <p className={styles.body}>{RA_BODY}</p>
      <dl className={styles.stats}>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Worlds</dt>
          <dd className={styles.statValue}>{worlds.length}</dd>
        </div>
      </dl>
    </>
  );
}

function WorldView({
  world,
  onOpenStory,
}: {
  world: World;
  onOpenStory: (slug: string) => void;
}) {
  return (
    <>
      <p className={styles.eyebrow}>World</p>
      <h2 className={styles.heading}>{world.title}</h2>
      <p className={styles.theme}>
        <span
          className={styles.miniListDot}
          style={{ background: world.signature.primaryColor }}
          aria-hidden="true"
        />
        <span className={styles.body}>rai.app/@{world.slug}</span>
      </p>
      <p className={styles.body}>
        {world.tagline ||
          'A world in the RAI universe. Open its art-story to look inside.'}
      </p>
      <button
        type="button"
        className={styles.openStory}
        onClick={() => onOpenStory(world.slug)}
      >
        Open art-story
      </button>
      <Link href={`/@${world.slug}`} className={styles.openStory}>
        Visit its page
      </Link>
    </>
  );
}

function CtaGroup({ authState }: { authState: AuthState }) {
  if (authState === 'authNoObservatory') {
    return (
      <div className={styles.ctaGroup}>
        <Link href="/create" className={styles.ctaPrimary}>
          Create your world
        </Link>
      </div>
    );
  }
  if (authState === 'authWithObservatory') {
    return (
      <div className={styles.ctaGroup}>
        <Link href="/dashboard" className={styles.ctaPrimary}>
          Go to Dashboard
        </Link>
      </div>
    );
  }
  // 'guest' or 'unknown' (safe default = guest CTA)
  return (
    <div className={styles.ctaGroup}>
      <Link href="/signup" className={styles.ctaPrimary}>
        Create your world
      </Link>
      <Link href="/login" className={styles.ctaSecondary}>
        Sign in
      </Link>
    </div>
  );
}
