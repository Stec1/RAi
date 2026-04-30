import type { ButtonHTMLAttributes } from 'react';
import styles from './AuthSubmit.module.css';

// Primary submit button shared between login and signup. Disabled +
// label-swap covers the inline pending state without spinners.

type AuthSubmitProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingLabel?: string;
};

export function AuthSubmit({
  pending = false,
  pendingLabel = 'Working…',
  children,
  disabled,
  type = 'submit',
  ...rest
}: AuthSubmitProps) {
  return (
    <button
      type={type}
      className={styles.button}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export const authSubmitStyles = styles;
