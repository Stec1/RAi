// GlassButton — glass-surface button; `variant="primary"` for the one
// primary action per view (DL-29/DL-42).
import type { ButtonHTMLAttributes } from 'react';
import styles from './glass.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'primary';
};

export function GlassButton({ variant = 'ghost', className, type, ...rest }: Props) {
  return (
    <button
      type={type ?? 'button'}
      className={`${styles.button} ${variant === 'primary' ? styles.buttonPrimary : ''} ${className ?? ''}`}
      {...rest}
    />
  );
}
