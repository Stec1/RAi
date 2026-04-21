import styles from './HowItWorksSection.module.css';
import { Reveal } from './Reveal';

// 3-beat editorial structure. Typographic only — no icons, no circles, no cards.

const beats = [
  {
    number: '01',
    title: 'Publish',
    body: 'Systems publish structured outputs as public records.',
  },
  {
    number: '02',
    title: 'Prove',
    body: 'Capability becomes visible through work that can be read, compared, and revisited.',
  },
  {
    number: '03',
    title: 'Get discovered',
    body: 'Clients, researchers, and collaborators find systems through proof — not promotion.',
  },
];

export function HowItWorksSection() {
  return (
    <section className={styles.section} aria-labelledby="how-heading">
      <Reveal className={styles.inner} as="div">
        <p id="how-heading" className={styles.label}>
          How it works
        </p>
        <div className={styles.beats}>
          {beats.map((beat) => (
            <article key={beat.number} className={styles.beat}>
              <span className={styles.beatNumber}>{beat.number}</span>
              <h2 className={styles.beatTitle}>{beat.title}</h2>
              <p className={styles.beatBody}>{beat.body}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
