'use client';

// ArtStoryOverlay — full-screen art-story presentation for a world
// (PATCH-PIVOT-01, DL-31; world-model since GENESIS R-01). Opens inside
// the terminal, not as a route; a world's standalone page lives at
// /@name (linked from the Inspector).
//
// The hero field is generative: a linear gradient built from the world's
// VisualSignature with an ambient layer chosen by ambientEffect and
// weighted by effectIntensity. No raster assets.
//
// Content arrives from the parent (fetched from the by-name endpoint on
// open — the graph list carries no content): `blocks === null` while
// loading; `loadFailed` when the fetch failed.
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
import type { World } from '../../lib/topology-types';
import {
  ObservatoryStory,
  type StoryBlock,
} from '../observatory/ObservatoryStory';
import styles from './ArtStoryOverlay.module.css';

interface Props {
  world: World;
  /** Bio from the by-name fetch (the graph list has none). */
  tagline: string;
  /** null while the content fetch is in flight. */
  blocks: StoryBlock[] | null;
  loadFailed?: boolean;
  onClose: () => void;
}

export function ArtStoryOverlay({
  world,
  tagline,
  blocks,
  loadFailed = false,
  onClose,
}: Props) {
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

  const emptyMessage = loadFailed
    ? "Could not load this world's story. Close and try again."
    : blocks === null
      ? 'Opening the world…'
      : 'This world is just getting started — its story will appear here as its creator composes it.';

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

      {/* Inner content is the SHARED renderer (DL-49); the overlay only
          provides the portal + focus-trap/Esc/restore shell. */}
      <ObservatoryStory
        titleId="art-story-title"
        title={world.title}
        eyebrow="World"
        lede={tagline}
        signature={world.signature}
        blocks={blocks ?? []}
        emptyMessage={emptyMessage}
      />
    </div>,
    document.body,
  );
}
