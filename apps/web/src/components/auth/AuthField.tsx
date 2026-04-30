import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './AuthField.module.css';

// Labeled text input used in both LoginForm and SignupForm.
// `error` is the inline message; when present, the input gets
// aria-invalid and the global :focus-visible ring still fires for
// keyboard users.

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string;
  optionalHint?: ReactNode;
};

export function AuthField({
  id,
  label,
  error,
  optionalHint,
  ...inputProps
}: AuthFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optionalHint ? <span className={styles.optional}>{optionalHint}</span> : null}
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
