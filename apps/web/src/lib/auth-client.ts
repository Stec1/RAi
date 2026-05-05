// Better Auth client.
//
// Browser calls go to the same web origin (`/api/auth/*`); the Next.js
// rewrite (apps/web/next.config.mjs) forwards them to the upstream API.
// This keeps the session cookie first-party on the web origin so it
// reliably persists across modern browsers (Safari ITP, third-party
// cookie blocking, etc.) — the previous direct cross-site setup
// (vercel.app -> railway.app) was unreliable.
//
// During SSR `window` is not defined; we fall back to NEXT_PUBLIC_API_URL
// or an empty string. The auth client is only ever invoked in the browser
// in this app, so the SSR branch is a safety net, not a hot path.

import { createAuthClient } from 'better-auth/react';

function resolveBaseURL(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_API_URL ?? '';
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
