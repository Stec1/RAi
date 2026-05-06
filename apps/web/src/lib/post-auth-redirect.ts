// Shared post-auth redirect resolver.
//
// Per DL-26 (Explore as the Primary Post-Auth Topology Surface):
//   - authenticated, no Observatory → `/explore`  (public topology + CTA)
//   - authenticated, has Observatory → `/dashboard`
//
// Rationale: signed-in users without an Observatory now land on the
// public topology, where the auth-aware CTA in ExploreInfoPanel routes
// them to /create. Going straight to a hidden create flow obscures what
// RAi is and skips the topology — the heart of the product.
//
// Browser fetches are same-origin (`/api/me`); the Next.js rewrite
// (apps/web/next.config.mjs) forwards to the upstream API. This keeps
// the session cookie first-party on the web origin, which the previous
// direct cross-site setup could not reliably guarantee in modern
// browsers.

export type PostAuthDestination = '/explore' | '/dashboard';

type MeResponse = {
  observatory: { id: string; name: string } | null;
};

/**
 * Resolve where the user should land after authenticating.
 * Falls back to `/explore` on any network or shape error so the user
 * is never stranded on the auth screen with a successful session.
 * `/explore` is publicly browsable, always exists, and surfaces the
 * Create-Observatory CTA per DL-26.
 */
export async function resolvePostAuthDestination(
  signal?: AbortSignal,
): Promise<PostAuthDestination> {
  try {
    const res = await fetch('/api/me', {
      credentials: 'include',
      signal,
    });
    if (!res.ok) return '/explore';
    const data = (await res.json()) as MeResponse | null;
    if (!data) return '/explore';
    return data.observatory === null ? '/explore' : '/dashboard';
  } catch {
    return '/explore';
  }
}
