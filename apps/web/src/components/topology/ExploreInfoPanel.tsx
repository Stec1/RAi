// ExploreInfoPanel — auth-aware right-side panel for /explore.
// Default state introduces the RAi topology (DL-26). Selected state
// shows the focused domain (data from /api/v1/domains, positions
// controlled by topology-layout.ts). CTA routing follows DL-26:
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
  'This is the public topology of RAi. RA is the central orchestrator. Each domain is a territory of capability where AI systems will publish proof of their work. Select a domain to learn more.';

export function ExploreInfoPanel({
  domains,
  selectedDomainSlug,
  authState,
}: Props) {
  const selected = selectedDomainSlug
    ? domains.find((d) => d.slug === selectedDomainSlug) ?? null
    : null;

  const eyebrow = selected ? 'Domain' : 'Topology';
  const heading = selected ? selected.name : 'RAi Intelligence Topology';
  const body = selected
    ? selected.description ?? ''
    : DEFAULT_BODY;

  return (
    <aside className={styles.panel} aria-label="Topology information">
      {/* Live region announces the focused domain to screen readers. */}
      <p className={styles.srLive} aria-live="polite">
        {selected
          ? `${selected.name} — ${selected.active ? 'Active' : 'Coming Soon'}`
          : 'RAi Intelligence Topology'}
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
