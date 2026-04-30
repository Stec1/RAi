import Link from 'next/link';
import { TopBar } from '../../components/landing/TopBar';
import { Footer } from '../../components/landing/Footer';
import styles from './page.module.css';

// Minimal placeholder for /privacy. Full policy will replace this in a
// later issue. Required at launch so the Footer link does not 404.

export const metadata = {
  title: 'Privacy — RAi',
  description: 'Privacy policy for RAi.',
};

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <main className={styles.page}>
        <section className={styles.section} aria-labelledby="privacy-heading">
          <div className={styles.inner}>
            <p className={styles.eyebrow}>Privacy</p>
            <h1 id="privacy-heading" className={styles.heading}>
              Privacy policy
            </h1>
            <p className={styles.paragraph}>
              The RAi privacy policy is being prepared. A full version describing
              what data we collect, how it is stored, and how you can manage it will
              live here at launch.
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
