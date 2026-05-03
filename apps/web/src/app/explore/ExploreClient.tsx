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

export function ExploreClient() {
  const [domains, setDomains] = useState<DomainDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError('API URL is not configured.');
      return;
    }
    const controller = new AbortController();
    fetch(`${apiUrl}/api/v1/domains`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DomainsResponse>;
      })
      .then((data) => setDomains(data.domains))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Could not load the topology.');
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
