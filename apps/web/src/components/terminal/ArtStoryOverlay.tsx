'use client';

// ArtStoryOverlay — full-screen art-story presentation for an observatory
// (PATCH-PIVOT-01, DL-31). Opens inside the terminal, not as a route.
//
// The hero field is generative: a linear gradient built from the
// observatory's VisualSignature (gradientAngle, primaryColor,
// secondaryColor) with an ambient layer chosen by ambientEffect and
// weighted by effectIntensity. No raster assets.
//
// Accessibility: role="dialog" aria-modal, focus moves to the close
// button on open, Tab is trapped inside the overlay, Escape closes, and
// focus returns to the previously focused element (the Inspector's
// `Open art-story` button) on exit.
//
// PATCH-PIVOT-02: rendered through a React portal to document.body so
// the overlay always sits ABOVE all terminal chrome and can never be
// clipped, scaled, or stacked under a panel — regardless of where the
// opener lives in the tree. (The overlay only ever mounts from a client
// interaction, so document is always defined.)

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { MockObservatory } from '../../data/mock-observatories';
import styles from './ArtStoryOverlay.module.css';

interface Props {
  observatory: MockObservatory;
  /** The owning domain's display name, when known. */
  domainName?: string;
  onClose: () => void;
}

const KIND_LABEL: Record<MockObservatory['kind'], string> = {
  'real-place': 'Real place',
  'virtual-world': 'Virtual world',
};

export function ArtStoryOverlay({ observatory, domainName, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Keep the latest onClose reachable from the mount-once effect below
  // without re-binding the document listener on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      // Focus trap: cycle through the overlay's focusable elements.
      const focusables = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  const { signature } = observatory;
  const eyebrow = domainName
    ? `${KIND_LABEL[observatory.kind]} · ${domainName}`
    : KIND_LABEL[observatory.kind];

  const ambientClass =
    signature.ambientEffect === 'glow'
      ? styles.ambientGlow
      : signature.ambientEffect === 'drift'
        ? styles.ambientDrift
        : signature.ambientEffect === 'pulse'
          ? styles.ambientGlow
          : styles.ambientStatic;

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="art-story-title"
    >
      <button
        ref={closeButtonRef}
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Close story"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>

      <section
        className={styles.hero}
        style={{
          background: `linear-gradient(${signature.gradientAngle}deg, ${signature.primaryColor}, ${signature.secondaryColor})`,
        }}
      >
        {/* Ambient layer — wrapper carries effectIntensity so the
            keyframed inner opacity composes with it. */}
        <div
          className={styles.ambientWrap}
          style={{ opacity: signature.effectIntensity }}
          aria-hidden="true"
        >
          <div className={ambientClass} />
        </div>
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="art-story-title" className={styles.title}>
            {observatory.title}
          </h2>
          <p className={styles.tagline}>{observatory.tagline}</p>
        </div>
      </section>

      <div className={styles.body}>
        {observatory.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h3 className={styles.sectionHeading}>{section.heading}</h3>
            <p className={styles.sectionBody}>{section.body}</p>
          </section>
        ))}
        <div className={styles.ctaRow}>
          <button type="button" className={styles.cta} disabled>
            {observatory.cta}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
