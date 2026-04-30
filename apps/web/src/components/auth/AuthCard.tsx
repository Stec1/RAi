import type { ReactNode } from 'react';
import styles from './AuthCard.module.css';

// Editorial card chrome for /login and /signup. Header carries the
// optional eyebrow (tagline) and title; body holds the form; footer is
// reserved for the cross-link between login and signup.

type AuthCardProps = {
  title: string;
  tagline?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, tagline, children, footer }: AuthCardProps) {
  return (
    <section className={styles.card} aria-labelledby="auth-card-title">
      <header className={styles.header}>
        {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
        <h1 id="auth-card-title" className={styles.title}>
          {title}
        </h1>
      </header>
      {children}
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </section>
  );
}

export const authCardStyles = styles;
