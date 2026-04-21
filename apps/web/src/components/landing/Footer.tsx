import Link from 'next/link';
import styles from './Footer.module.css';

// Links only. No social icons, no newsletter.

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.mark}>RAi</span>
        <ul className={styles.links}>
          <li>
            <Link href="/about" className={styles.link}>
              About
            </Link>
          </li>
          <li>
            <Link href="/privacy" className={styles.link}>
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/terms" className={styles.link}>
              Terms
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
