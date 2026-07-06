'use client';

// /create — the Observatory Studio (PATCH-PIVOT-04, DL-42).
//
// Auth gate unchanged: unauthenticated visitors are pushed to /login.
// Additionally (§ PP-04 wiring): if /api/me shows an existing
// observatory, redirect to /dashboard — one-per-user is not
// re-implemented here beyond this existing check; the API enforces it
// for real (DL-41).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/ui/PageShell';
import { ObservatoryStudio } from '../../components/studio/ObservatoryStudio';
import { useAuth } from '../../hooks/useAuth';

export default function CreatePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [gate, setGate] = useState<'checking' | 'ok'>('checking');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const controller = new AbortController();
    fetch('/api/me', { credentials: 'include', signal: controller.signal })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: { observatory: { id: string } | null } | null) => {
        if (data?.observatory) {
          router.replace('/dashboard');
          return;
        }
        setGate('ok');
      })
      .catch(() => setGate('ok'));
    return () => controller.abort();
  }, [isLoading, user, router]);

  if (isLoading || !user || gate !== 'ok') {
    return <main aria-busy="true" />;
  }

  return (
    <PageShell>
      <ObservatoryStudio userName={user.name ?? ''} />
    </PageShell>
  );
}
