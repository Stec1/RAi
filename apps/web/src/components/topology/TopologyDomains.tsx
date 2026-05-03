'use client';

// Renders all 7 Domains as textured planes at their seed positions.
// Active Domains: full opacity, base scale.
// Coming Soon Domains: reduced opacity (0.45) and ~0.75x scale — but still
// rendered from the real branded PNG, never recolored or replaced with a
// circle. Domain "color hints" are intentionally not consumed here.

import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import type { DomainDTO } from '../../lib/topology-types';

const ACTIVE_PATHS: Record<string, string> = {
  nexum: '/domain-objects/active/nexum-domain-object.png',
  keth: '/domain-objects/active/keth-domain-object.png',
  solum: '/domain-objects/active/solum-domain-object.png',
};

const COMING_SOON_PATHS: Record<string, string> = {
  vorda: '/domain-objects/coming-soon/vorda-domain-object.png',
  lyren: '/domain-objects/coming-soon/lyren-domain-object.png',
  auren: '/domain-objects/coming-soon/auren-domain-object.png',
  draxis: '/domain-objects/coming-soon/draxis-domain-object.png',
};

const ALL_PATHS: string[] = [
  ...Object.values(ACTIVE_PATHS),
  ...Object.values(COMING_SOON_PATHS),
];

// Preload at module level so the canvas does not pop in.
ALL_PATHS.forEach((path) => useTexture.preload(path));

const DOMAIN_PLANE_ACTIVE = 180;
const DOMAIN_PLANE_COMING_SOON = 135; // 0.75x of active
const COMING_SOON_OPACITY = 0.45;

export function TopologyDomains({ domains }: { domains: DomainDTO[] }) {
  const textures = useTexture(ALL_PATHS);

  // Map path → Texture once, keyed by stable path identity.
  const pathToTexture = useMemo(() => {
    const map = new Map<string, THREE.Texture>();
    ALL_PATHS.forEach((path, i) => {
      const tex = textures[i];
      if (tex) {
        // PNGs are pre-baked; do not let three's tone mapping shift them.
        tex.colorSpace = THREE.SRGBColorSpace;
        map.set(path, tex);
      }
    });
    return map;
  }, [textures]);

  return (
    <>
      {domains.map((domain) => {
        const path = domain.active
          ? ACTIVE_PATHS[domain.slug]
          : COMING_SOON_PATHS[domain.slug];
        if (!path) return null;
        const texture = pathToTexture.get(path);
        if (!texture) return null;
        const size = domain.active
          ? DOMAIN_PLANE_ACTIVE
          : DOMAIN_PLANE_COMING_SOON;
        const opacity = domain.active ? 1 : COMING_SOON_OPACITY;
        return (
          <mesh
            key={domain.id}
            position={[domain.positionX, domain.positionY, 0]}
          >
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial
              map={texture}
              transparent
              depthWrite={false}
              opacity={opacity}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </>
  );
}
