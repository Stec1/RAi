// GlassCard — content card on the premium glass surface (DL-29/DL-42).
import type { HTMLAttributes } from 'react';
import styles from './glass.module.css';

export function GlassCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.card} ${className ?? ''}`} {...rest} />;
}
