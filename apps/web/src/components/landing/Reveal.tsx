'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './Reveal.module.css';

// Lightweight Intersection Observer fade-up reveal.
// Allowed per the motion contract. Falls back to immediately-visible
// when reduced motion is requested or IO is unavailable.
//
// `style` is optional and additive (e.g. a per-item transition-delay for
// staggered reveals); it is spread onto the wrapper element.

export function Reveal({
  children,
  as: Tag = 'div',
  className,
  style,
}: {
  children: ReactNode;
  as?: 'div' | 'section';
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const classes = [styles.reveal, visible ? styles.visible : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref as never} className={classes} style={style}>
      {children}
    </Tag>
  );
}
