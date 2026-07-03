'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '../../components/auth/AuthShell';
import { AuthCard, authCardStyles } from '../../components/auth/AuthCard';
import { useAuth } from '../../hooks/useAuth';
import styles from './page.module.css';

// Placeholder for the post-signup landing page.
//
// Background: prior to this hotfix, /create did not exist. Both the home
// redirect rule and `resolvePostAuthDestination`'s fallback target /create,
// so a successful sign-up always landed on a 404. The full Observatory
// creation flow ships in a later issue; for now this page guarantees the
// user lands on something real.
//
// Auth-guarded — visitors without a session are pushed to /login. The
// session is read via Better Auth's `useSession` (`/api/auth/get-session`),
// which is independent of the `/api/me` call and therefore not affected by
// any Observatory-related lookup.

export default function CreatePage() {
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
        tagline="Next step"
        title="Create your Observatory"
        footer={
          <p>
            Want to look around first?{' '}
            <Link href="/explore" className={authCardStyles.footerLink}>
              Explore the universe
            </Link>
          </p>
        }
      >
        <div className={styles.body}>
          <p className={styles.lede}>
            Your observatory is your place in the RAI universe — an
            art-directed story about somewhere real, or a world of your own
            making.
          </p>
          <p className={styles.note}>
            Your account is ready. The full creation flow is coming soon and
            will appear here as soon as it ships.
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
