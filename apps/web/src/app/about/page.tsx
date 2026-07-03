import Link from 'next/link';
import { TopBar } from '../../components/landing/TopBar';
import { Footer } from '../../components/landing/Footer';
import { Reveal } from '../../components/landing/Reveal';
import styles from './page.module.css';

// /about — public, single-column editorial overview of RAI for visitors
// who want to understand the universe in depth before signing up.
//
// Copy is sourced from docs/concept-pivot.md (PATCH-PIVOT-01, DL-31).
// MVP-facing prose only: no SI terminology, no governance jargon
// (community verification is always "community-verified"), no dated
// promises. World Mode is described as coming, never demoed.

export const metadata = {
  title: 'About — RAi',
  description:
    'RAI is a universe of observatories — art-directed stories about real places and virtual worlds.',
};

export default function AboutPage() {
  return (
    <>
      <TopBar />
      <main className={styles.page}>
        <section className={styles.section} aria-labelledby="about-heading">
          <Reveal as="div" className={`${styles.hero}`}>
            <div className={styles.inner}>
              <p className={styles.eyebrow}>About RAI</p>
              <h1 id="about-heading" className={styles.heading}>
                A universe of observatories.
              </h1>
              <p className={styles.lead}>
                Knowledge about places is scattered across social posts, map
                reviews, and the memories of guides. RAI gathers it into
                observatories — coherent, art-directed stories about real
                places and virtual worlds.{' '}
                <strong>Every place has a story. Tell yours.</strong>
              </p>
            </div>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="what-heading">
          <Reveal as="div" className={styles.body}>
            <div className={styles.inner}>
              <p className={styles.tag}>The idea</p>
              <h2 id="what-heading" className={styles.subheading}>
                What RAI is
              </h2>
              <p className={styles.paragraph}>
                RAI is a universe of observatories — real places, virtual
                worlds, and the stories people tell about them. You arrive in
                a living graph: RA at the center, seven domains around it,
                observatories settling near the domains they belong to. Each
                observatory opens as a full-screen art-story — one subject,
                told well.
              </p>
              <p className={styles.paragraph}>
                <strong>RAI shows. RAI does not execute.</strong> The platform
                presents stories, coordinates their verification, and settles
                reputation. The telling belongs to the people who publish.
              </p>
            </div>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="structure-heading">
          <Reveal as="div" className={styles.body}>
            <div className={styles.inner}>
              <p className={styles.tag}>How it&apos;s organized</p>
              <h2 id="structure-heading" className={styles.subheading}>
                Observatories and Domains
              </h2>
              <ul className={styles.list}>
                <li className={styles.listItem}>
                  <strong>Observatory.</strong> Your place in the RAI universe:
                  an art-story about something real — a castle, a restaurant,
                  a street, an event, a business — or something virtual, like
                  generative art or an imagined space. Any format: narrative,
                  gallery, graph, presentation room, and 3D in the future.
                </li>
                <li className={styles.listItem}>
                  <strong>Domain.</strong> Seven domains give the universe its
                  thematic structure. Three are active today; four are being
                  prepared. An observatory settles near the domain its story
                  belongs to.
                </li>
                <li className={styles.listItem}>
                  <strong>Art-story.</strong> The unit of publication: one
                  coherent, art-directed presentation of a subject — not a
                  feed of posts, not a review page, not a listing.
                </li>
              </ul>
            </div>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="worlds-heading">
          <Reveal as="div" className={styles.body}>
            <div className={styles.inner}>
              <p className={styles.tag}>The two worlds</p>
              <h2 id="worlds-heading" className={styles.subheading}>
                A virtual universe now, the real world next
              </h2>
              <p className={styles.paragraph}>
                Today RAI is a virtual universe: the living graph you can
                wander on the terminal, where stories are discovered by
                proximity and curiosity. A second mode is coming — a
                real-world map where observatories pin to actual coordinates,
                so the story of a place lives where the place does. Until it
                arrives, the universe is the map.
              </p>
            </div>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="community-heading">
          <Reveal as="div" className={styles.body}>
            <div className={styles.inner}>
              <p className={styles.tag}>Trust</p>
              <h2 id="community-heading" className={styles.subheading}>
                Community-verified, by design
              </h2>
              <p className={styles.paragraph}>
                Stories on RAI will be open to contribution and
                community-verified: claims can be questioned, corrections
                proposed, and disagreements resolved in the open. Reputation
                will build from how a story holds up — not from who shouts
                loudest. These mechanics arrive after the universe itself;
                the principle is fixed now.
              </p>
            </div>
          </Reveal>
        </section>

        <section className={styles.section} aria-labelledby="cta-heading">
          <Reveal as="div" className={styles.cta}>
            <div className={styles.ctaInner}>
              <h2 id="cta-heading" className={styles.ctaHeading}>
                Start an observatory.
              </h2>
              <p className={styles.paragraph}>
                Pick a place — real or imagined — and give its story a home.
              </p>
              <Link href="/signup" className={styles.ctaButton}>
                Get Started
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
