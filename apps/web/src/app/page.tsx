'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { TopBar } from '../components/landing/TopBar';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { DomainShowcaseSection } from '../components/landing/DomainShowcaseSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/landing/Footer';

// Post-login redirect rules (ISSUE-05, preserved):
//   - not authenticated        → render the public Start Page
//   - authenticated, no Obs    → `/create`
//   - authenticated, has Obs   → `/dashboard`
//
// Observatory info lives on `/api/me` (see apps/api/src/routes/me.ts), not
// in the Better Auth session, so resolve it once after the session loads.

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  // `redirecting` suppresses the Start Page flash while we resolve the
  // authenticated user's observatory and navigate away.
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    setRedirecting(true);
    const controller = new AbortController();
    fetch(`${apiUrl}/api/me`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data: { observatory: { id: string; name: string } | null } | null) => {
        if (!data) {
          setRedirecting(false);
          return;
        }
        router.replace(data.observatory === null ? '/create' : '/dashboard');
      })
      .catch(() => {
        // Swallow aborts / network errors — user can retry by reloading.
        setRedirecting(false);
      });

    return () => controller.abort();
  }, [isLoading, user, router]);

  if (isLoading || redirecting) {
    return <main aria-busy="true" />;
  }

  return (
    <>
      <TopBar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <DomainShowcaseSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
