'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthCard, authCardStyles } from '../../components/auth/AuthCard';
import { useAuth } from '../../hooks/useAuth';
import styles from './page.module.css';

// Placeholder for the authenticated user's dashboard.
//
// Background: prior to this hotfix, /dashboard did not exist. The
// post-auth redirect resolver routes returning users with an
// Observatory here, so without this page they'd 404 on log-in. The
// real dashboard ships in a later issue.
//
// Auth-guarded — unauthenticated visitors are pushed to /login. The
// session is read via Better Auth's `useSession`
// (`/api/auth/get-session`), independent of any `/api/me` call.

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [redirectingToLogin, setRedirectingToLogin] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setRedirectingToLogin(true);
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || redirectingToLogin || !user) {
    return <main aria-busy="true" />;
  }

  return (
    <AuthShell>
      <AuthCard
        tagline="Welcome back"
        title="Your RAI Dashboard"
        footer={
          <p>
            Looking for the public side?{' '}
            <Link href="/explore" className={authCardStyles.footerLink}>
              Explore the universe
            </Link>
          </p>
        }
      >
        <div className={styles.body}>
          <p className={styles.lede}>
            Your dashboard is the quiet side of your observatory — where
            you will shape its story, publish new sections, and follow how
            the community receives them.
          </p>
          <p className={styles.note}>
            You&rsquo;re signed in. The full dashboard is on the way and
            will appear here as soon as it ships.
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
