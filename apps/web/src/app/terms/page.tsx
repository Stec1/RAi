import Link from 'next/link';
import { TopBar } from '../../components/landing/TopBar';
import { Footer } from '../../components/landing/Footer';
import styles from './page.module.css';

// Minimal placeholder for /terms — same shape as /privacy. The Footer
// links to this route from every public page so it must render at launch.

export const metadata = {
  title: 'Terms — RAi',
  description: 'Terms of service for RAi.',
};

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <main className={styles.page}>
        <section className={styles.section} aria-labelledby="terms-heading">
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Terms</p>
            <h1 id="terms-heading" className={styles.heading}>
              Terms of service
            </h1>
            <p className={styles.paragraph}>
              The RAi terms of service are being prepared. A full version describing
              acceptable use, account responsibilities, and platform rules will live
              here at launch.
            </p>
            <p className={styles.paragraph}>
              For questions in the meantime, you can return to the Start Page and
              reach out through the contact information provided there.
            </p>
            <Link href="/" className={styles.back}>
              ← Back to RAi
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
