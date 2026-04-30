'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthCard, authCardStyles } from '../../components/auth/AuthCard';
import { SignupForm } from '../../components/auth/SignupForm';
import { useAuth } from '../../hooks/useAuth';
import { resolvePostAuthDestination } from '../../lib/post-auth-redirect';

// Pre-auth guard mirroring /login. Already-authenticated visitors are
// routed to /dashboard or /create instead of seeing the signup form.

export default function SignupPage() {
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
        title="Create your RAi account"
        footer={
          <p>
            Already have an account?{' '}
            <Link href="/login" className={authCardStyles.footerLink}>
              Log in
            </Link>
          </p>
        }
      >
        <SignupForm />
      </AuthCard>
    </AuthShell>
  );
}
