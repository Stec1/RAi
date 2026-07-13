// /@name — a world's public page (GENESIS R-01, R-DL-05).
//
// Root dynamic segment: every static route (/, /explore, /create,
// /dashboard, /login, /signup, /privacy, /terms, /about) takes precedence
// automatically; anything else lands here and MUST be an @-handle —
// `/@wawel-dragons-hill` — or it 404s.
//
// Server component: it fetches the world server-side from the API origin
// (the same upstream the /api/* proxy uses — see next.config.mjs),
// FORWARDING the request cookies so an owner can view their own
// `unpublished` world. The by-name endpoint enforces visibility:
// public/private → 200 for anyone; unpublished → owner only, else 404.
// The fetch is wrapped in React cache() so generateMetadata and the page
// share one request.

import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ObservatoryStory } from '../../components/observatory/ObservatoryStory';
import { contentToStoryBlocks } from '../../lib/universe-observatories';
import type {
  ContentBlock,
  ObservatoryVisibility,
  VisualSignature,
} from '../../lib/topology-types';
import styles from './page.module.css';

// The world always reflects its current visibility + content.
export const dynamic = 'force-dynamic';

interface WorldPayload {
  observatory: {
    name: string;
    displayName: string;
    type: string;
    visibility: ObservatoryVisibility;
    content: ContentBlock[] | null;
    visualSignature: VisualSignature | null;
    bio: string | null;
    publishedAt: string | null;
  };
}

// Extract the world name from the segment, or null when the segment is
// not an @-handle (the guard: no `@` prefix → 404).
function handleToName(handle: string): string | null {
  const raw = decodeURIComponent(handle);
  if (!raw.startsWith('@')) return null;
  const name = raw.slice(1).toLowerCase();
  return name.length > 0 ? name : null;
}

// One fetch per request, shared by generateMetadata + the page (cache()).
// Server-side we talk to the API origin directly — the /api/* rewrite is
// a browser-facing proxy — and forward the cookie header for owner views.
const fetchWorld = cache(async (name: string) => {
  const upstream = (process.env.API_PROXY_ORIGIN || 'http://localhost:3001').replace(/\/+$/, '');
  const cookie = headers().get('cookie');
  try {
    const res = await fetch(
      `${upstream}/api/v1/observatories/by-name/${encodeURIComponent(name)}`,
      {
        cache: 'no-store',
        headers: cookie ? { cookie } : undefined,
      },
    );
    if (res.status === 404) return { state: 'missing' as const };
    if (!res.ok) return { state: 'error' as const };
    const json = (await res.json()) as WorldPayload;
    if (!json?.observatory) return { state: 'error' as const };
    return { state: 'ok' as const, world: json.observatory };
  } catch {
    return { state: 'error' as const };
  }
});

const FALLBACK_SIGNATURE: VisualSignature = {
  primaryColor: '#8890a8',
  secondaryColor: '#22304a',
  accentColor: '#e8edf5',
  gradientAngle: 32,
  ambientEffect: 'glow',
  effectIntensity: 0.45,
  surfaceStyle: 'smooth',
  nodeStyle: 'point',
};

const STATUS_LINE: Record<ObservatoryVisibility, string> = {
  unpublished: 'unpublished — only you can see this',
  private: 'private — link-only',
  public: 'public',
};

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const name = handleToName(params.handle);
  if (!name) return { title: 'RAI' };
  const result = await fetchWorld(name);
  if (result.state !== 'ok') return { title: 'RAI' };
  return {
    title: `${result.world.displayName} — RAI`,
    description: result.world.bio ?? undefined,
  };
}

export default async function WorldPage({
  params,
}: {
  params: { handle: string };
}) {
  const name = handleToName(params.handle);
  if (!name) notFound();

  const result = await fetchWorld(name);
  if (result.state === 'missing') notFound();

  if (result.state === 'error') {
    return (
      <main className={styles.page}>
        <div className={styles.strip}>
          <Link href="/" className={styles.wordmark}>
            RAI
          </Link>
        </div>
        <div className={styles.errorState}>
          <p className={styles.errorEyebrow}>rai.app/@{name}</p>
          <h1 className={styles.errorTitle}>The universe is unreachable</h1>
          <p className={styles.errorBody}>
            This world could not be loaded right now. Try again in a moment.
          </p>
        </div>
      </main>
    );
  }

  const { world } = result;
  const blocks = contentToStoryBlocks(world.content);

  return (
    <main className={styles.page}>
      <div className={styles.strip}>
        <Link href="/" className={styles.wordmark}>
          RAI
        </Link>
        <span className={styles.status} data-visibility={world.visibility}>
          {STATUS_LINE[world.visibility]}
        </span>
      </div>
      <ObservatoryStory
        title={world.displayName}
        eyebrow="World"
        metadata={`rai.app/@${world.name}`}
        lede={world.bio ?? ''}
        signature={world.visualSignature ?? FALLBACK_SIGNATURE}
        blocks={blocks}
        emptyMessage="This world is just getting started — its story will appear here as its creator composes it."
      />
    </main>
  );
}
