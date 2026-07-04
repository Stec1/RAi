// TopologyObservatories — observatory nodes on the Explore topology
// (DL-35: first-class entities). Visually distinct from domain nodes:
// smaller, styled from each observatory's VisualSignature (primaryColor,
// nodeStyle, ambientEffect), joined to their domain by a short live
// tether (slow dash flow per DL-37).
//
// Entry model (PATCH-PIVOT-02): a node click SELECTS the observatory in
// the Inspector — it does not open the overlay. The Inspector's "Open
// art-story" button is the single overlay entry. Mouse/touch selection
// is dispatched centrally by TopologyCanvas from its pointerup hit-test
// (pointer capture retargets click events to the <svg> root, so a
// per-node onClick never fires with real input — Phase 0 diagnosis).
// This component reports hover and handles the keyboard path.
//
// `hot` (hover from pointer, Registry row, or selection) reveals the
// name + kind label and the focus ring — CSS :hover alone can't cover
// Registry-driven highlighting.
//
// Currently fed by MOCK data (src/data/mock-observatories.ts) — swap
// the source, not this renderer, when real Observatory data lands.

import type { KeyboardEvent } from 'react';
import type { MockObservatory } from '../../data/mock-observatories';
import type { Vec2 } from './topology-layout';
import styles from './TopologyObservatories.module.css';

export type ObservatoryOnCanvas = {
  observatory: MockObservatory;
  /** Resolved canvas position (guarded — see TopologyCanvas). */
  position: Vec2;
  /** The tether's far end: the owning domain, when present. */
  domainPosition: Vec2 | null;
};

interface Props {
  nodes: ObservatoryOnCanvas[];
  hoveredSlug: string | null;
  selectedSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}

const KIND_LABEL: Record<MockObservatory['kind'], string> = {
  'real-place': 'Real place',
  'virtual-world': 'Virtual world',
};

function NodeGlyph({ observatory }: { observatory: MockObservatory }) {
  const { nodeStyle, primaryColor, ambientEffect } = observatory.signature;

  const haloClass =
    ambientEffect === 'glow'
      ? styles.haloGlow
      : ambientEffect === 'drift'
        ? styles.haloDrift
        : styles.haloStatic;

  return (
    <>
      <circle r={14} fill={primaryColor} className={haloClass} />
      {nodeStyle === 'ring' && (
        <>
          <circle r={8} fill="none" stroke={primaryColor} strokeWidth={1.5} />
          <circle r={2.2} fill={primaryColor} />
        </>
      )}
      {nodeStyle === 'pulse' && (
        <>
          <circle r={8} fill={primaryColor} className={styles.pulseRing} />
          <circle r={4} fill={primaryColor} />
        </>
      )}
      {nodeStyle === 'point' && <circle r={5} fill={primaryColor} />}
      {nodeStyle === 'cross' && (
        <path
          d="M -6 0 H 6 M 0 -6 V 6"
          stroke={primaryColor}
          strokeWidth={1.5}
          fill="none"
        />
      )}
    </>
  );
}

export function TopologyObservatories({
  nodes,
  hoveredSlug,
  selectedSlug,
  onHover,
  onSelect,
}: Props) {
  return (
    <g>
      {nodes.map(({ observatory, position, domainPosition }) => {
        const isHot =
          hoveredSlug === observatory.slug || selectedSlug === observatory.slug;

        const handleKey = (event: KeyboardEvent<SVGGElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(observatory.slug);
          }
        };

        return (
          <g key={observatory.slug}>
            {/* Live tether back to the owning domain (DL-37). */}
            {domainPosition ? (
              <line
                x1={position.x}
                y1={position.y}
                x2={domainPosition.x}
                y2={domainPosition.y}
                className={`${styles.tether} ${isHot ? styles.tetherHot : ''}`}
                aria-hidden="true"
              />
            ) : null}
            <g
              transform={`translate(${position.x} ${position.y})`}
              className={styles.node}
              data-hot={isHot ? 'true' : undefined}
              role="button"
              tabIndex={0}
              aria-label={`${observatory.title} — ${KIND_LABEL[observatory.kind]}`}
              aria-pressed={selectedSlug === observatory.slug}
              data-slug={`observatory:${observatory.slug}`}
              onPointerEnter={() => onHover(observatory.slug)}
              onPointerLeave={() => onHover(null)}
              onFocus={() => onHover(observatory.slug)}
              onBlur={() => onHover(null)}
              onKeyDown={handleKey}
            >
              {/* Focus ring — driven by hot state (pointer, Registry
                  row, or selection). */}
              <circle
                r={13}
                fill="none"
                stroke="var(--graph-ring)"
                strokeWidth={1}
                style={{ opacity: isHot ? 1 : 0, transition: 'opacity 150ms ease' }}
              />
              <NodeGlyph observatory={observatory} />
              {/* Name + kind label — revealed on hot. */}
              <g className={styles.label} data-hot={isHot ? 'true' : undefined} aria-hidden="true">
                <text
                  y={-26}
                  textAnchor="middle"
                  fontFamily="var(--font-space-grotesk), sans-serif"
                  fontSize={12}
                  fontWeight={300}
                  fill="var(--text-primary)"
                >
                  {observatory.title}
                </text>
                <text
                  y={-14}
                  textAnchor="middle"
                  fontFamily="var(--font-inter), sans-serif"
                  fontSize={9}
                  letterSpacing="0.08em"
                  fill="var(--text-secondary)"
                  style={{ textTransform: 'uppercase' }}
                >
                  {KIND_LABEL[observatory.kind]}
                </text>
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
