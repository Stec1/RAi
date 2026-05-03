'use client';

// RA hub at world (0, 0). Larger and visually heavier than any Domain plane.
// PNG comes from the same asset family used by the ISSUE-06 Start Page hero.
//
// Ambient pulse: opacity 40% → 70% → 40% over 8s. Gated entirely on
// !prefers-reduced-motion && !isSmallViewport per the visual reference and
// founder decision D3. When gated off, RA stays at full opacity.

import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const RA_TEXTURE_PATH = '/domain-objects/ra/RA-domain-object.png';
const RA_PLANE_SIZE = 320;
const PULSE_PERIOD_S = 8;
const PULSE_MIN = 0.4;
const PULSE_MAX = 0.7;
const PULSE_MID = (PULSE_MIN + PULSE_MAX) / 2;
const PULSE_AMP = (PULSE_MAX - PULSE_MIN) / 2;

useTexture.preload(RA_TEXTURE_PATH);

interface Props {
  pulseEnabled: boolean;
}

export function TopologyRA({ pulseEnabled }: Props) {
  const texture = useTexture(RA_TEXTURE_PATH);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;
    if (!pulseEnabled) {
      mat.opacity = 1;
      return;
    }
    // Smooth sinusoidal cycle through PULSE_MIN..PULSE_MAX..PULSE_MIN.
    const phase = (clock.getElapsedTime() % PULSE_PERIOD_S) / PULSE_PERIOD_S;
    mat.opacity = PULSE_MID + PULSE_AMP * Math.sin(phase * Math.PI * 2);
  });

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[RA_PLANE_SIZE, RA_PLANE_SIZE]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
