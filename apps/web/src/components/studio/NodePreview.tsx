// NodePreview — the draft rendered "as a node" in the Living Crystal
// Graph language (DL-37/DL-42). Mirrors the glyph + bloom rendering of
// components/topology/TopologyObservatories.tsx (keep in sync) and
// reuses its CSS module so the ambient motion — and its
// prefers-reduced-motion fallbacks — match the real topology exactly.

import type { VisualSignature } from '../../data/mock-observatories';
import obsStyles from '../topology/TopologyObservatories.module.css';

export function NodePreview({ signature }: { signature: VisualSignature }) {
  const { primaryColor, accentColor, nodeStyle, ambientEffect } = signature;
  const haloClass =
    ambientEffect === 'glow'
      ? obsStyles.haloGlow
      : ambientEffect === 'drift'
        ? obsStyles.haloDrift
        : obsStyles.haloStatic;

  return (
    <svg viewBox="-30 -30 60 60" width="120" height="120" role="img" aria-label="Node preview">
      <defs>
        <radialGradient id="studio-node-orb">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.95" />
          <stop offset="45%" stopColor={primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="studio-node-bloom">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
          <stop offset="60%" stopColor={primaryColor} stopOpacity="0.14" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={16} fill="url(#studio-node-bloom)" className={haloClass} />
      {nodeStyle === 'ring' && (
        <>
          <circle r={8} fill="none" stroke={primaryColor} strokeWidth={1.5} />
          <circle r={2.6} fill="url(#studio-node-orb)" />
        </>
      )}
      {nodeStyle === 'pulse' && (
        <>
          <circle r={8} fill={primaryColor} className={obsStyles.pulseRing} />
          <circle r={4.5} fill="url(#studio-node-orb)" />
        </>
      )}
      {nodeStyle === 'point' && <circle r={5.5} fill="url(#studio-node-orb)" />}
      {nodeStyle === 'cross' && (
        <>
          <path d="M -6 0 H 6 M 0 -6 V 6" stroke={primaryColor} strokeWidth={1.5} fill="none" />
          <circle r={2} fill="url(#studio-node-orb)" />
        </>
      )}
    </svg>
  );
}
