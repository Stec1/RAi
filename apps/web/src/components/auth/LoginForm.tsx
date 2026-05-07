'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { resolvePostAuthDestination } from '../../lib/post-auth-redirect';
import { AuthField } from './AuthField';
import { AuthSubmit, authSubmitStyles } from './AuthSubmit';
import styles from './LoginForm.module.css';

// Email/password sign-in. No Google OAuth, no password reset link
// (founder decisions §2 of ISSUE-07). On success we resolve
// Observatory state via /api/me and route the user to /dashboard or
// /explore — DL-26.

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) errors.password = 'Password is required.';
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setFormError(null);

    setPending(true);
    const { error } = await signIn({
      email: email.trim(),
      password,
    });

    if (error) {
      setPending(false);
      setFormError(
        error.message ?? 'We could not sign you in with those credentials.',
      );
      return;
    }

    // Same-origin call — the Next.js rewrite proxies `/api/me` upstream.
    // Falls back to `/explore` on any error — `/explore` is public,
    // always reachable, and surfaces the next-step CTA per DL-26.
    const destination = await resolvePostAuthDestination();
    router.replace(destination);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <AuthField
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />
      <AuthField
        id="login-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      <div className={styles.actions}>
        {formError ? (
          <p className={authSubmitStyles.formError} role="alert">
            {formError}
          </p>
        ) : null}
        <AuthSubmit pending={pending} pendingLabel="Signing in…">
          Log in
        </AuthSubmit>
      </div>
    </form>
  );
}
