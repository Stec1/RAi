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
// Observatory state lives on `/api/me` (apps/api/src/routes/me.ts). The
// session cookie is `sameSite: "lax"` (decision-log DL-24), so we must
// pass `credentials: "include"` for the cross-origin call.

export type PostAuthDestination = '/create' | '/dashboard';

type MeResponse = {
  observatory: { id: string; name: string } | null;
};

/**
 * Resolve where the user should land after authenticating.
 * Falls back to `/create` on any network or shape error so the user is
 * never stranded on the auth screen with a successful session.
 */
export async function resolvePostAuthDestination(
  apiUrl: string,
  signal?: AbortSignal,
): Promise<PostAuthDestination> {
  try {
    const res = await fetch(`${apiUrl}/api/me`, {
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
