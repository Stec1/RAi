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

// Trim trailing slash(es) from a base URL so `${base}/api/...` never produces
// `host.tld//api/...` — proxies and CDNs sometimes 404 on doubled slashes.
function joinApiUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}${path}`;
}

function isDomainsResponse(value: unknown): value is DomainsResponse {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as { domains?: unknown };
  return Array.isArray(maybe.domains);
}

export function ExploreClient() {
  const [domains, setDomains] = useState<DomainDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError('API URL is not configured.');
      return;
    }
    const target = joinApiUrl(apiUrl, '/api/v1/domains');
    const controller = new AbortController();

    fetch(target, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} from ${target}`);
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
            target,
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
