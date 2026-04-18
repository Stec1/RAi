// useAuth — single source of auth state + methods for client components.

'use client';

import { authClient, signIn, signUp, signOut, useSession } from '../lib/auth-client';

export function useAuth() {
  const { data, isPending } = useSession();

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isLoading: isPending,
    signIn: signIn.email,
    signUp: signUp.email,
    signOut,
    client: authClient,
  };
}
