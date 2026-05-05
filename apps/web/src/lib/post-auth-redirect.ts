// Shared post-auth redirect resolver.
//
// After a successful sign-in or sign-up the browser holds a fresh Better Auth
// session cookie, but the API decides where the user belongs based on whether
// an Observatory exists. We mirror the rule used by the public Start Page
// (apps/web/src/app/page.tsx):
//
//   - authenticated, no Observatory → `/create`
//   - authenticated, has Observatory → `/dashboard`
//
// Browser fetches are same-origin (`/api/me`); the Next.js rewrite
// (apps/web/next.config.mjs) forwards to the upstream API. This keeps the
// session cookie first-party on the web origin, which the previous direct
// cross-site setup could not reliably guarantee in modern browsers.

export type PostAuthDestination = '/create' | '/dashboard';

type MeResponse = {
  observatory: { id: string; name: string } | null;
};

/**
 * Resolve where the user should land after authenticating.
 * Falls back to `/create` on any network or shape error so the user is
 * never stranded on the auth screen with a successful session. `/create`
 * always exists (see apps/web/src/app/create/page.tsx) so the fallback
 * never produces a 404.
 */
export async function resolvePostAuthDestination(
  signal?: AbortSignal,
): Promise<PostAuthDestination> {
  try {
    const res = await fetch('/api/me', {
      credentials: 'include',
      signal,
    });
    if (!res.ok) return '/create';
    const data = (await res.json()) as MeResponse | null;
    if (!data) return '/create';
    return data.observatory === null ? '/create' : '/dashboard';
  } catch {
    return '/create';
  }
}
