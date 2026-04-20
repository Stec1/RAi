'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

// Post-login redirect rules:
//   - not authenticated        → stay on `/`
//   - authenticated, no Obs    → `/create`
//   - authenticated, has Obs   → `/dashboard`
//
// Observatory info lives on `/api/me` (see apps/api/src/routes/me.ts), not
// in the Better Auth session, so resolve it once after the session loads.

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const controller = new AbortController();
    fetch(`${apiUrl}/api/me`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: { observatory: { id: string; name: string } | null } | null) => {
        if (!data) return;
        router.replace(data.observatory === null ? '/create' : '/dashboard');
      })
      .catch(() => {
        // Swallow aborts / network errors — user can retry by reloading.
      });

    return () => controller.abort();
  }, [isLoading, user, router]);

  return <main>RAi</main>;
}
