// ExploreInfoPanel — the terminal's docked Inspector content (DL-36).
// Persistent (not slide-in): shows the focused entity —
//   • nothing focused → universe intro
//   • RA             → about RAI + platform stats
//   • domain         → name, state, theme, description, observatories here
//   • observatory    → name, kind, domain, tagline + `Open art-story`
// The auth-aware CTA follows DL-26 and is unchanged by the pivot:
//   guest                  → /signup primary, /login secondary
//   authNoObservatory      → /create
//   authWithObservatory    → /dashboard
//   unknown                → guest CTA (safe default)
// The `Open art-story` button is the single entry to the overlay
// (PATCH-PIVOT-02 entry model: node click = select, Inspector = open).

import Link from 'next/link';
import type { DomainSeed } from './topology-layout';
import { domainColor } from './topology-layout';
import type { EntityRef } from './TopologyCanvas';
import type { MockObservatory } from '../../data/mock-observatories';
import styles from './ExploreInfoPanel.module.css';

export type AuthState =
  | 'guest'
  | 'authNoObservatory'
  | 'authWithObservatory'
  | 'unknown';

interface Props {
  focus: EntityRef | null;
  domains: DomainSeed[];
  observatories: MockObservatory[];
  authState: AuthState;
  onOpenStory: (slug: string) => void;
  onSelectObservatory: (slug: string) => void;
}

const DEFAULT_BODY =
  'This is the RAI universe. RA sits at the center; each domain is a region of stories; observatories settle near the domains they belong to. Select a node to look closer.';

const RA_BODY =
  'RA is the coordinating core of the universe. It shows stories, coordinates their verification, and settles reputation — it never executes anything itself.';

const KIND_LABEL: Record<MockObservatory['kind'], string> = {
  'real-place': 'Real place',
  'virtual-world': 'Virtual world',
};

export function ExploreInfoPanel({
  focus,
  domains,
  observatories,
  authState,
  onOpenStory,
  onSelectObservatory,
}: Props) {
  const domain =
    focus?.kind === 'domain'
      ? domains.find((d) => d.slug === focus.slug) ?? null
      : null;
  const observatory =
    focus?.kind === 'observatory'
      ? observatories.find((o) => o.slug === focus.slug) ?? null
      : null;

  const liveText = observatory
    ? `${observatory.title} — ${KIND_LABEL[observatory.kind]}`
    : domain
      ? `${domain.name} — ${domain.active ? 'Active' : 'Coming Soon'}`
      : focus?.kind === 'ra'
        ? 'RA — the coordinating core'
        : 'The RAI universe';

  return (
    <aside className={styles.panel} aria-label="Inspector">
      {/* Live region announces the focused entity to screen readers. */}
      <p className={styles.srLive} aria-live="polite">
        {liveText}
      </p>

      {observatory ? (
        <ObservatoryView
          observatory={observatory}
          domains={domains}
          onOpenStory={onOpenStory}
        />
      ) : domain ? (
        <DomainView
          domain={domain}
          observatories={observatories}
          onSelectObservatory={onSelectObservatory}
        />
      ) : focus?.kind === 'ra' ? (
        <RaView domains={domains} observatories={observatories} />
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

function RaView({
  domains,
  observatories,
}: {
  domains: DomainSeed[];
  observatories: MockObservatory[];
}) {
  const active = domains.filter((d) => d.active).length;
  return (
    <>
      <p className={styles.eyebrow}>Core</p>
      <h2 className={styles.heading}>RA</h2>
      <p className={styles.body}>{RA_BODY}</p>
      <dl className={styles.stats}>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Domains</dt>
          <dd className={styles.statValue}>{domains.length}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Active</dt>
          <dd className={styles.statValue}>{active}</dd>
        </div>
        <div className={styles.statRow}>
          <dt className={styles.statLabel}>Observatories</dt>
          <dd className={styles.statValue}>{observatories.length}</dd>
        </div>
      </dl>
    </>
  );
}

function DomainView({
  domain,
  observatories,
  onSelectObservatory,
}: {
  domain: DomainSeed;
  observatories: MockObservatory[];
  onSelectObservatory: (slug: string) => void;
}) {
  const here = observatories.filter((o) => o.domainSlug === domain.slug);
  return (
    <>
      <p className={styles.eyebrow}>Domain</p>
      <h2 className={styles.heading}>{domain.name}</h2>
      <p className={domain.active ? styles.statusActive : styles.statusComing}>
        {domain.active ? 'Active' : 'Coming Soon'}
      </p>
      {domain.theme ? <p className={styles.theme}>{domain.theme}</p> : null}
      {domain.description ? (
        <p className={styles.body}>{domain.description}</p>
      ) : null}
      <div className={styles.miniList}>
        <p className={styles.miniListLabel}>
          Observatories · {here.length}
        </p>
        {here.length === 0 ? (
          <p className={styles.miniListEmpty}>None here yet.</p>
        ) : (
          here.map((o) => (
            <button
              key={o.slug}
              type="button"
              className={styles.miniListRow}
              onClick={() => onSelectObservatory(o.slug)}
            >
              <span
                className={styles.miniListDot}
                style={{ background: o.signature.primaryColor }}
                aria-hidden="true"
              />
              <span className={styles.miniListName}>{o.title}</span>
              <span className={styles.miniListKind}>
                {o.kind === 'real-place' ? 'place' : 'world'}
              </span>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function ObservatoryView({
  observatory,
  domains,
  onOpenStory,
}: {
  observatory: MockObservatory;
  domains: DomainSeed[];
  onOpenStory: (slug: string) => void;
}) {
  const domainName =
    domains.find((d) => d.slug === observatory.domainSlug)?.name ??
    observatory.domainSlug;
  return (
    <>
      <p className={styles.eyebrow}>{KIND_LABEL[observatory.kind]}</p>
      <h2 className={styles.heading}>{observatory.title}</h2>
      <p className={styles.theme}>
        <span
          className={styles.miniListDot}
          style={{ background: domainColor(observatory.domainSlug) }}
          aria-hidden="true"
        />
        {domainName}
      </p>
      <p className={styles.body}>{observatory.tagline}</p>
      <button
        type="button"
        className={styles.openStory}
        onClick={() => onOpenStory(observatory.slug)}
      >
        Open art-story
      </button>
    </>
  );
}

function CtaGroup({ authState }: { authState: AuthState }) {
  if (authState === 'authNoObservatory') {
    return (
      <div className={styles.ctaGroup}>
        <Link href="/create" className={styles.ctaPrimary}>
          Create Observatory
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
        Create Observatory
      </Link>
      <Link href="/login" className={styles.ctaSecondary}>
        Sign in
      </Link>
    </div>
  );
}
