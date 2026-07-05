// TopologyObservatories — observatory satellites on the Living Crystal
// Graph (DL-35 / DL-37 amended). Each renders from its VisualSignature:
// a soft bloom halo + a luminous core in primaryColor, shaped by
// nodeStyle (point / ring / pulse / cross), animated by ambientEffect
// (glow / drift), and joined to its domain by a short curved luminous
// gradient tether.
//
// Interaction is unchanged from PATCH-PIVOT-02: node click = select into
// the Inspector (dispatched centrally by TopologyCanvas from its
// pointerup hit-test — pointer capture retargets click events to the
// <svg> root); the Inspector's "Open art-story" button is the single
// overlay entry. This component reports hover and handles the keyboard
// path. `hot` (pointer, Registry row, or selection) reveals the name +
// kind label and the focus ring.
//
// Currently fed by MOCK data (src/data/mock-observatories.ts) — swap
// the source, not this renderer, when real Observatory data lands.

import type { KeyboardEvent } from 'react';
import type { MockObservatory } from '../../data/mock-observatories';
import type { Vec2 } from './topology-layout';
import { curvedEdgePath, domainColor } from './topology-layout';
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
  const { nodeStyle, ambientEffect } = observatory.signature;
  const slug = observatory.slug;

  const haloClass =
    ambientEffect === 'glow'
      ? styles.haloGlow
      : ambientEffect === 'drift'
        ? styles.haloDrift
        : styles.haloStatic;

  const core = `url(#lcg-obs-orb-${slug})`;
  const primary = observatory.signature.primaryColor;

  return (
    <>
      {/* Bloom halo — signature luminance. */}
      <circle r={16} fill={`url(#lcg-obs-bloom-${slug})`} className={haloClass} />
      {nodeStyle === 'ring' && (
        <>
          <circle r={8} fill="none" stroke={primary} strokeWidth={1.5} />
          <circle r={2.6} fill={core} />
        </>
      )}
      {nodeStyle === 'pulse' && (
        <>
          <circle r={8} fill={primary} className={styles.pulseRing} />
          <circle r={4.5} fill={core} />
        </>
      )}
      {nodeStyle === 'point' && <circle r={5.5} fill={core} />}
      {nodeStyle === 'cross' && (
        <>
          <path
            d="M -6 0 H 6 M 0 -6 V 6"
            stroke={primary}
            strokeWidth={1.5}
            fill="none"
          />
          <circle r={2} fill={core} />
        </>
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
      {/* Per-observatory gradients (core, bloom, tether). */}
      <defs>
        {nodes.map(({ observatory, position, domainPosition }) => {
          const { primaryColor, accentColor } = observatory.signature;
          return (
            <g key={`defs-${observatory.slug}`}>
              <radialGradient id={`lcg-obs-orb-${observatory.slug}`}>
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.95" />
                <stop offset="45%" stopColor={primaryColor} stopOpacity="1" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
              </radialGradient>
              <radialGradient id={`lcg-obs-bloom-${observatory.slug}`}>
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
                <stop offset="60%" stopColor={primaryColor} stopOpacity="0.14" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
              </radialGradient>
              {domainPosition ? (
                <linearGradient
                  id={`lcg-tether-${observatory.slug}`}
                  gradientUnits="userSpaceOnUse"
                  x1={domainPosition.x}
                  y1={domainPosition.y}
                  x2={position.x}
                  y2={position.y}
                >
                  <stop
                    offset="0%"
                    stopColor={domainColor(observatory.domainSlug)}
                    stopOpacity={0.45}
                  />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity={0.8} />
                </linearGradient>
              ) : null}
            </g>
          );
        })}
      </defs>

      {nodes.map(({ observatory, position, domainPosition }, index) => {
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
            {/* Curved luminous tether back to the owning domain. */}
            {domainPosition ? (
              <path
                d={curvedEdgePath(domainPosition, position, index, 0.14)}
                fill="none"
                stroke={`url(#lcg-tether-${observatory.slug})`}
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
              {/* Focus ring — pointer, Registry row, or selection. */}
              <circle
                r={13}
                fill="none"
                stroke="var(--graph-ring)"
                strokeWidth={1}
                style={{ opacity: isHot ? 1 : 0, transition: 'opacity 150ms ease' }}
              />
              <NodeGlyph observatory={observatory} />
              {/* Name + kind label — revealed on hot. */}
              <g
                className={styles.label}
                data-hot={isHot ? 'true' : undefined}
                aria-hidden="true"
              >
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
