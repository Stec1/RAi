'use client';

// ObservatoryStory — the single shared presentational renderer for an
// observatory's board (PATCH-PIVOT-08, DL-49). It turns the same ordered
// blocks into a directed art-story: a signature-driven hero, per-type
// block "moods", signature-permeated accents, and scroll-reveal tempo.
//
// BOTH render sites use this one component so they can never diverge:
//   • the Explore art-story overlay (its portal/focus-trap/Esc/restore
//     shell stays; only its inner content is <ObservatoryStory/>), and
//   • the /create studio live preview.
//
// It only PRESENTS the blocks — it does not create or store them. The
// block data model is unchanged; `variant` and `fullBleed` are OPTIONAL
// hints, ignored when absent (old drafts and un-hinted blocks render by
// type-based defaults).
//
// Motion: block reveal reuses the shared IntersectionObserver <Reveal>
// (reduced-motion → immediately visible); the hero breathes gently
// (reduced-motion → static). All colors flow from the VisualSignature via
// CSS custom properties so each observatory feels like its own world;
// body reading text stays readability-first.

import type { CSSProperties } from 'react';
import { Reveal } from '../landing/Reveal';
import type { VisualSignature } from '../../lib/topology-types';
import styles from './ObservatoryStory.module.css';

export type StoryBlockType = 'heading' | 'text' | 'image' | 'note' | 'link';

export interface StoryBlock {
  id: string;
  type: StoryBlockType;
  content: string;
  caption?: string;
  url?: string;
  /** Resolved image src (a local object URL in the studio; none for mocks). */
  imageUrl?: string;
  /** Optional presentational hint, e.g. 'quote' | 'fact'. Defaulted by type. */
  variant?: string;
  /** Optional image hint. */
  fullBleed?: boolean;
}

interface Props {
  title: string;
  /** e.g. "World". */
  eyebrow?: string;
  /** Quiet metadata line (displayName / type). */
  metadata?: string;
  /** Tagline or first strong thesis line. */
  lede?: string;
  signature: VisualSignature;
  blocks: StoryBlock[];
  /** Disabled CTA label for demo art-stories; omitted for real ones. */
  footerCta?: string | null;
  /** Shown after the hero when there are no blocks. */
  emptyMessage?: string;
  /** Heading id (the overlay points aria-labelledby at it). */
  titleId?: string;
}

const DEFAULT_EMPTY = 'This observatory is just getting started.';

function ambientClass(effect: VisualSignature['ambientEffect']): string {
  if (effect === 'drift') return styles.ambientDrift;
  if (effect === 'static') return styles.ambientStatic;
  return styles.ambientGlow; // glow + pulse
}

// A block's mood. Explicit `variant` wins; otherwise type-based default.
function BlockView({ block }: { block: StoryBlock }) {
  const { type, variant, content, caption } = block;

  if (type === 'heading') {
    return (
      <div className={styles.divider}>
        <span className={styles.dividerRule} aria-hidden="true" />
        <h3 className={styles.dividerHeading}>{content || '—'}</h3>
      </div>
    );
  }

  if (type === 'link') {
    const href = block.url && /^https?:\/\//i.test(block.url) ? block.url : undefined;
    const label = content || block.url || 'Open link';
    return (
      <div className={styles.blockWrap}>
        {href ? (
          <a className={styles.linkCard} href={href} target="_blank" rel="noopener noreferrer">
            <span className={styles.linkLabel}>{label}</span>
            <span className={styles.linkArrow} aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className={`${styles.linkCard} ${styles.linkCardInert}`}>
            <span className={styles.linkLabel}>{label}</span>
          </span>
        )}
        {caption ? <p className={styles.caption}>{caption}</p> : null}
      </div>
    );
  }

  if (type === 'image') {
    return (
      <figure className={`${styles.imageBand} ${block.fullBleed ? styles.imageFull : ''}`}>
        {block.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.imageUrl} alt={caption || 'Observatory image'} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true">
            image
          </div>
        )}
        {caption ? <figcaption className={styles.imageCaption}>{caption}</figcaption> : null}
      </figure>
    );
  }

  // A 'fact' hint (on text or note) → big number + small caption.
  if (variant === 'fact') {
    return (
      <div className={styles.blockWrap}>
        <div className={styles.fact}>
          <span className={styles.factValue}>{content || '—'}</span>
          {caption ? <span className={styles.factCaption}>{caption}</span> : null}
        </div>
      </div>
    );
  }

  // note (or text hinted 'quote') → oversized quote / manifesto voice.
  if (type === 'note' || variant === 'quote') {
    return (
      <div className={styles.blockWrap}>
        <blockquote className={styles.quote}>{content || '—'}</blockquote>
        {caption ? <p className={styles.caption}>{caption}</p> : null}
      </div>
    );
  }

  // text → readable editorial column.
  return (
    <div className={styles.blockWrap}>
      <p className={styles.text}>{content || '—'}</p>
      {caption ? <p className={styles.caption}>{caption}</p> : null}
    </div>
  );
}

export function ObservatoryStory({
  title,
  eyebrow,
  metadata,
  lede,
  signature,
  blocks,
  footerCta,
  emptyMessage,
  titleId,
}: Props) {
  // Signature colors permeate the whole story via custom properties.
  const rootStyle = {
    '--story-primary': signature.primaryColor,
    '--story-secondary': signature.secondaryColor,
    '--story-accent': signature.accentColor,
  } as CSSProperties;

  const heroStyle = {
    background: `linear-gradient(${signature.gradientAngle}deg, ${signature.primaryColor}, ${signature.secondaryColor})`,
  } as CSSProperties;

  return (
    <article className={styles.story} style={rootStyle}>
      <section className={styles.hero} style={heroStyle}>
        <div
          className={`${styles.ambient} ${ambientClass(signature.ambientEffect)}`}
          style={{ opacity: Math.min(1, Math.max(0, signature.effectIntensity)) }}
          aria-hidden="true"
        />
        <div className={styles.heroBreath} aria-hidden="true" />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroContent}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {metadata ? <p className={styles.metadata}>{metadata}</p> : null}
          {lede ? <p className={styles.lede}>{lede}</p> : null}
        </div>
      </section>

      <div className={styles.body}>
        {blocks.length > 0 ? (
          blocks.map((block, i) => (
            <Reveal
              key={block.id}
              className={styles.revealItem}
              // Subtle stagger, capped so long stories never lag.
              style={{ transitionDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <BlockView block={block} />
            </Reveal>
          ))
        ) : (
          <p className={styles.emptyLine}>{emptyMessage || DEFAULT_EMPTY}</p>
        )}

        {footerCta ? (
          <div className={styles.ctaRow}>
            <button type="button" className={styles.cta} disabled>
              {footerCta}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
