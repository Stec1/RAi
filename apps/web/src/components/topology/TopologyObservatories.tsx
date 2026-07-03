// TopologyObservatories — observatory nodes on the universe canvas
// (PATCH-PIVOT-01, DL-31). Visually distinct from domain nodes: smaller,
// styled from each observatory's VisualSignature (primaryColor, nodeStyle,
// ambientEffect), tethered to their domain by a faint dashed line.
//
// Hover/focus reveals a name + kind label; click (or Enter/Space) opens
// the full-screen art-story overlay via onOpen. Each group carries
// data-slug so TopologyCanvas's click-vs-drag logic treats these as
// nodes, not background.
//
// Currently fed by MOCK data (src/data/mock-observatories.ts) — swap the
// source, not this renderer, when real Observatory data lands.

import type { CSSProperties, KeyboardEvent } from 'react';
import type { MockObservatory } from '../../data/mock-observatories';
import type { Vec2 } from './topology-layout';
import styles from './TopologyObservatories.module.css';

export type ObservatoryOnCanvas = {
  observatory: MockObservatory;
  /** Resolved canvas position: domain position + fixed offset. */
  position: Vec2;
  /** The owning domain's position — the tether's far end. */
  domainPosition: Vec2;
};

interface Props {
  nodes: ObservatoryOnCanvas[];
  onOpen: (slug: string) => void;
}

const KIND_LABEL: Record<MockObservatory['kind'], string> = {
  'real-place': 'Real place',
  'virtual-world': 'Virtual world',
};

function NodeGlyph({ observatory }: { observatory: MockObservatory }) {
  const { nodeStyle, primaryColor, ambientEffect } = observatory.signature;

  // Soft ambient halo behind the glyph. `glow` breathes; `drift` sways
  // sideways; `pulse`/`static` rest (the pulse style animates the glyph
  // itself). Classes live in the module CSS with reduced-motion fallbacks.
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
          <circle
            r={8}
            fill="none"
            stroke={primaryColor}
            strokeWidth={1.5}
          />
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

export function TopologyObservatories({ nodes, onOpen }: Props) {
  return (
    <g>
      {nodes.map(({ observatory, position, domainPosition }) => {
        const handleKey = (event: KeyboardEvent<SVGGElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(observatory.slug);
          }
        };

        return (
          <g key={observatory.slug}>
            {/* Tether back to the owning domain — belonging, not traffic. */}
            <line
              x1={position.x}
              y1={position.y}
              x2={domainPosition.x}
              y2={domainPosition.y}
              stroke="var(--graph-line)"
              strokeWidth={1}
              strokeDasharray="2 4"
              aria-hidden="true"
            />
            <g
              transform={`translate(${position.x} ${position.y})`}
              className={styles.node}
              role="button"
              tabIndex={0}
              aria-label={`${observatory.title} — ${KIND_LABEL[observatory.kind]}. Open art-story.`}
              data-slug={`observatory:${observatory.slug}`}
              onClick={(event) => {
                event.stopPropagation();
                onOpen(observatory.slug);
              }}
              onKeyDown={handleKey}
            >
              <NodeGlyph observatory={observatory} />
              {/* Hover/focus label — name above, kind beneath it. */}
              <g className={styles.label} aria-hidden="true">
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
                  style={
                    { textTransform: 'uppercase' } as CSSProperties
                  }
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
