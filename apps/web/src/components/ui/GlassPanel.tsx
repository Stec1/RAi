// GlassPanel — larger glass region (DL-29/DL-42).
import type { HTMLAttributes } from 'react';
import styles from './glass.module.css';

export function GlassPanel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <section className={`${styles.panel} ${className ?? ''}`} {...rest} />;
}
