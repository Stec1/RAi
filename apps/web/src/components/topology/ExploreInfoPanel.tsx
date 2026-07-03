// ExploreInfoPanel — auth-aware side panel inside the RAI Terminal.
// Default state introduces the universe (DL-31); selected state shows
// the focused domain (data from /api/v1/domains, positions controlled
// by topology-layout.ts). CTA routing follows DL-26 and is unchanged
// by the pivot:
//   guest                  → /signup primary, /login secondary
//   authNoObservatory      → /create
//   authWithObservatory    → /dashboard
//   unknown                → guest CTA (safe default)

import Link from 'next/link';
import type { DomainSeed } from './topology-layout';
import styles from './ExploreInfoPanel.module.css';

export type AuthState =
  | 'guest'
  | 'authNoObservatory'
  | 'authWithObservatory'
  | 'unknown';

interface Props {
  domains: DomainSeed[];
  selectedDomainSlug: string | null;
  authState: AuthState;
}

const DEFAULT_BODY =
  'This is the RAI universe. RA sits at the center; each domain is a region of stories; observatories settle near the domains they belong to. Select a node to look closer.';

export function ExploreInfoPanel({
  domains,
  selectedDomainSlug,
  authState,
}: Props) {
  const selected = selectedDomainSlug
    ? domains.find((d) => d.slug === selectedDomainSlug) ?? null
    : null;

  const eyebrow = selected ? 'Domain' : 'Universe';
  const heading = selected ? selected.name : 'The RAI universe';
  const body = selected
    ? selected.description ?? ''
    : DEFAULT_BODY;

  return (
    <aside className={styles.panel} aria-label="Universe information">
      {/* Live region announces the focused domain to screen readers. */}
      <p className={styles.srLive} aria-live="polite">
        {selected
          ? `${selected.name} — ${selected.active ? 'Active' : 'Coming Soon'}`
          : 'The RAI universe'}
      </p>

      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.heading}>{heading}</h2>

      {selected ? (
        <>
          <p
            className={
              selected.active ? styles.statusActive : styles.statusComing
            }
          >
            {selected.active ? 'Active' : 'Coming Soon'}
          </p>
          {selected.theme ? (
            <p className={styles.theme}>{selected.theme}</p>
          ) : null}
          {body ? <p className={styles.body}>{body}</p> : null}
          {!selected.active ? (
            <p className={styles.footer}>Domain page coming soon.</p>
          ) : null}
        </>
      ) : (
        <p className={styles.body}>{body}</p>
      )}

      <CtaGroup authState={authState} />
    </aside>
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
