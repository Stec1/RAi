'use client';

// Client shell for /explore. Fetches the 7 Domains from `/api/v1/domains`,
// dynamic-imports the R3F canvas (ssr:false — three.js needs a real document),
// and renders the SVG mini-map alongside it.
//
// No auth guard: /explore is public. No TopBar/Footer/landing components — the
// canvas owns the full viewport per the visual reference.

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { MiniMap } from '../../components/topology/MiniMap';
import type { DomainDTO } from '../../lib/topology-types';
import styles from './page.module.css';

// three.js touches `window` at module evaluation, so the canvas must be
// client-only. The wrapping div keeps layout stable while the chunk loads.
const TopologyCanvas = dynamic(
  () =>
    import('../../components/topology/TopologyCanvas').then(
      (mod) => mod.TopologyCanvas,
    ),
  { ssr: false },
);

interface DomainsResponse {
  domains: DomainDTO[];
}

function isDomainsResponse(value: unknown): value is DomainsResponse {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as { domains?: unknown };
  return Array.isArray(maybe.domains);
}

// Same-origin path — the Next.js rewrite (apps/web/next.config.mjs) proxies
// `/api/*` to the upstream API, so the browser does not perform a cross-site
// fetch and CORS/cookies are no longer in play here.
const DOMAINS_PATH = '/api/v1/domains';

export function ExploreClient() {
  const [domains, setDomains] = useState<DomainDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(DOMAINS_PATH, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} from ${DOMAINS_PATH}`);
        }
        const json: unknown = await res.json();
        if (!isDomainsResponse(json)) {
          throw new Error('Unexpected response shape from /api/v1/domains');
        }
        return json.domains;
      })
      .then((list) => setDomains(list))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Dev-only diagnostics — production users see the friendly message,
        // developers get enough detail in the console to triage.
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('[explore] failed to load topology:', err, {
            target: DOMAINS_PATH,
          });
        }
        setError('Could not load the topology. Check API connection.');
      });
    return () => controller.abort();
  }, []);

  return (
    <main className={styles.stage}>
      {error && <p className={styles.status}>{error}</p>}
      {!error && !domains && <p className={styles.status}>Loading…</p>}
      {domains && (
        <>
          <div className={styles.canvasWrap}>
            <TopologyCanvas domains={domains} />
          </div>
          <MiniMap domains={domains} />
        </>
      )}
    </main>
  );
}
