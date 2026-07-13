'use client';

// /dashboard — the owner's world screen (DL-47; adapted at GENESIS R-01).
//
// Auth-gated (unauthenticated → /login, unchanged). Fetches the caller's
// world via GET /api/v1/me/observatory: 404 → redirect to /create
// (matching the existing one-per-user routing), otherwise render the
// Dashboard. The domain fetch died with the domain layer (R-DL-02).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '../../components/ui/PageShell';
import { DashboardScreen } from '../../components/dashboard/DashboardScreen';
import type { OwnerObservatory } from '../../components/dashboard/DashboardScreen';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [gate, setGate] = useState<'checking' | 'ok'>('checking');
  const [observatory, setObservatory] = useState<OwnerObservatory | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const controller = new AbortController();
    fetch('/api/v1/me/observatory', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 404) {
          router.replace('/create');
          return null;
        }
        if (res.status === 401) {
          router.replace('/login');
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data: { observatory: OwnerObservatory } | null) => {
        if (data?.observatory) {
          setObservatory(data.observatory);
          setGate('ok');
        }
      })
      .catch(() => {
        /* leave in checking; a transient failure keeps the busy state */
      });
    return () => controller.abort();
  }, [isLoading, user, router]);

  if (isLoading || !user || gate !== 'ok' || !observatory) {
    return <main aria-busy="true" />;
  }

  return (
    <PageShell>
      <DashboardScreen initial={observatory} />
    </PageShell>
  );
}
