'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './TopBar.module.css';

// Transparent / light-glass sticky top bar.
// Exactly 3 interactive elements: logo → /about, Log in → /login, Get Started → /signup.
// Subtle state shift on scroll — allowed by the motion contract.

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/about" className={styles.logo} aria-label="RAi — About">
          RAi
        </Link>
        <nav className={styles.actions}>
          <Link href="/login" className={styles.link}>
            Log in
          </Link>
          <Link href="/signup" className={styles.cta}>
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
