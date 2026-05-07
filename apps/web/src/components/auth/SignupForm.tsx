'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { resolvePostAuthDestination } from '../../lib/post-auth-redirect';
import { AuthField } from './AuthField';
import { AuthSubmit, authSubmitStyles } from './AuthSubmit';
import styles from './LoginForm.module.css';

// Email + password registration. Display name is optional (founder
// decision §2 of ISSUE-07). After autoSignIn, resolvePostAuthDestination
// sends the new user to /explore — they have no Observatory yet (DL-26).
// The Create-Observatory entry point lives in ExploreInfoPanel's CTA.

const MIN_PASSWORD_LENGTH = 8;

type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
  displayName?: string;
};

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) errors.password = 'Password is required.';
    else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!confirm) errors.confirm = 'Please confirm your password.';
    else if (password && confirm !== password) {
      errors.confirm = 'Passwords do not match.';
    }
    const trimmedName = displayName.trim();
    if (trimmedName.length > 60) {
      errors.displayName = 'Display name is too long.';
    }
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

    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();
    const name = trimmedName.length > 0 ? trimmedName : trimmedEmail.split('@')[0];

    setPending(true);
    const { error } = await signUp({
      email: trimmedEmail,
      password,
      name,
    });

    if (error) {
      setPending(false);
      setFormError(
        error.message ?? 'We could not create your account. Try again.',
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
        id="signup-email"
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
        id="signup-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      <AuthField
        id="signup-confirm"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={fieldErrors.confirm}
      />
      <AuthField
        id="signup-displayname"
        label="Display name"
        optionalHint="(optional)"
        type="text"
        autoComplete="nickname"
        maxLength={60}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        error={fieldErrors.displayName}
      />
      <div className={styles.actions}>
        {formError ? (
          <p className={authSubmitStyles.formError} role="alert">
            {formError}
          </p>
        ) : null}
        <AuthSubmit pending={pending} pendingLabel="Creating account…">
          Get Started
        </AuthSubmit>
      </div>
    </form>
  );
}
