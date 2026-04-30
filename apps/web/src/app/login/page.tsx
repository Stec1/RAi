'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthCard, authCardStyles } from '../../components/auth/AuthCard';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { resolvePostAuthDestination } from '../../lib/post-auth-redirect';

// Pre-auth guard — already-authenticated visitors are pushed to their
// rightful destination (/dashboard or /create) instead of staring at a
// login card. We mirror Start Page semantics so the UX is consistent.

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    setRedirecting(true);
    const controller = new AbortController();
    resolvePostAuthDestination(apiUrl, controller.signal).then((destination) => {
      router.replace(destination);
    });
    return () => controller.abort();
  }, [isLoading, user, router]);

  if (isLoading || redirecting) {
    return <main aria-busy="true" />;
  }

  return (
    <AuthShell>
      <AuthCard
        tagline="Don't describe your AI. Prove it."
        title="Log in to RAi"
        footer={
          <p>
            New to RAi?{' '}
            <Link href="/signup" className={authCardStyles.footerLink}>
              Get Started
            </Link>
          </p>
        }
      >
        <LoginForm />
      </AuthCard>
    </AuthShell>
  );
}
