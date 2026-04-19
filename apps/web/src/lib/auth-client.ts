// Better Auth client configured for cross-origin cookie auth.
// Credentials: 'include' is required because the API is on a different origin
// than the web app (Railway API vs Vercel web).

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: 'include',
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
