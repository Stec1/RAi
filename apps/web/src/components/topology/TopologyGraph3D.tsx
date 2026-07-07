'use client';

// TopologyGraph3D — the Explore topology as a real WebGL 3D graph
// (PATCH-PIVOT-05, DL-43/DL-44/DL-45), rendered with react-force-graph-3d
// (Three.js) INSIDE the existing framed Topology panel.
//
// Loaded ONLY via next/dynamic with ssr:false (see RaiTerminal) so the
// three/react-force-graph footprint never runs on the server and stays
// code-split to the Explore surface.
//
// Scene contract:
//   • RA — faceted icosahedron crystal, warm gold emissive, dominant.
//   • All 7 domains — glowing identity-colored orbs; inactive ones are
//     dimmer/cooler but FULL nodes (DL-44), never hidden.
//   • Observatories — smaller orbs in their PARENT DOMAIN color with a
//     VisualSignature-accent ring (DL-45), tethered to their domain.
//   • Edges — thin lines in the far node's color with slow directional
//     particles as flow; hover/selection brightens node + edge.
//   • No persistent in-scene labels (PP-07 §2) — identity via Inspector
//     + Registry; the scene background follows the theme (PP-07 §1).
//   • Positions are pinned (fx/fy/fz) from the deterministic seed
//     layout, 3D-ified with per-index depth — no force jitter.
//
// Selection model preserved from PP-02: node click → onSelectEntity;
// background click → onClearSelect; hover → onHoverEntity; the Registry
// and Inspector drive/reflect the same EntityRef state.
//
// prefers-reduced-motion: idle auto-rotate and edge-flow particles are
// disabled; the graph stays fully interactive.
//
// Cleanup: all geometries/materials/textures we create are tracked and
// disposed on unmount, the bloom pass is removed, and the renderer is
// disposed — no WebGL context leaks on route change.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type { DomainSeed } from './topology-layout';
import {
  DESKTOP_RADII,
  computeDomainPositions,
  domainColor,
} from './topology-layout';
import type { MockObservatory } from '../../data/mock-observatories';
import type { EntityRef, ViewCommand } from '../../lib/topology-types';
import styles from './TopologyGraph3D.module.css';

interface Props {
  domains: DomainSeed[];
  observatories: MockObservatory[];
  hovered: EntityRef | null;
  selected: EntityRef | null;
  onHoverEntity: (ref: EntityRef | null) => void;
  onSelectEntity: (ref: EntityRef) => void;
  onClearSelect: () => void;
  viewCommand?: ViewCommand;
  showActiveOnly?: boolean;
  autoRotate?: boolean;
}

type GNode = {
  id: string;
  ref: EntityRef;
  label: string;
  color: string;
  accent?: string;
  kind: 'ra' | 'domain' | 'observatory';
  active: boolean;
  fx: number;
  fy: number;
  fz: number;
};

type GLink = {
  source: string;
  target: string;
  color: string;
  active: boolean;
};

const DEFAULT_CAMERA_Z = 640;
// Deterministic depth offsets so the ring reads as a 3D constellation.
const DOMAIN_Z = [-70, 30, 90, -40, 60, -90, 45];
// RA hub base emissive (A2) — brightest node but shows its gold, not a
// white core. The vibration loop (A3) modulates around this.
const RA_BASE_EMISSIVE = 0.7;
// Hover/selection emissive multiplier — brighten without blowing out.
const HOT_EMISSIVE = 1.7;

// Scene background follows the ACTIVE theme literally (PATCH-PIVOT-07 §1,
// superseding PP-06's "deep neutral in both themes"): the scene reads the
// panel's own canvas token so it flips black (dark) ↔ paper (light) with
// the chrome and blends seamlessly with the panel frame.
function readSceneBg(): string {
  if (typeof window === 'undefined') return '#050509';
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--surface-canvas')
    .trim();
  return v || '#050509';
}

function refId(ref: EntityRef): string {
  return ref.kind === 'ra' ? 'ra' : `${ref.kind}:${ref.slug}`;
}

// PATCH-PIVOT-07 §2: persistent in-scene node labels were removed. Node
// identity now lives only in the docked Inspector (on hover/selection)
// and the Registry rail. The graph shows glowing orbs + edges only; hover
// still highlights the node (scale/emissive) so it reads as interactive.

export default function TopologyGraph3D({
  domains,
  observatories,
  hovered,
  selected,
  onHoverEntity,
  onSelectEntity,
  onClearSelect,
  viewCommand,
  showActiveOnly = false,
  autoRotate = true,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const disposablesRef = useRef<Array<{ dispose: () => void }>>([]);
  const meshesRef = useRef<
    Map<string, { mesh: THREE.Mesh | THREE.Group; materials: THREE.MeshStandardMaterial[]; base: number[] }>
  >(new Map());
  const bloomRef = useRef<UnrealBloomPass | null>(null);
  // RA vibration (A3): refs to the hub mesh + material so a rAF loop can
  // modulate its scale/emissive; raHotRef mirrors hover/selection state.
  const raMeshRef = useRef<THREE.Object3D | null>(null);
  const raMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const raHotRef = useRef(false);
  // Emissive is scaled down on the light "paper" scene (PP-07 §1) so nodes
  // read as saturated diffuse orbs instead of washing toward white; kept
  // in a ref so the RA vibration rAF reads the current value.
  const emissiveFactorRef = useRef(1);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  // Scene clear color read from the panel's canvas token (PP-07 §1) so it
  // flips black (dark) ↔ paper (light) with the theme.
  const [sceneBg, setSceneBg] = useState<string>('#050509');

  // WebGL availability guard — composed fallback instead of a crash.
  const [webglOk] = useState<boolean>(() => {
    try {
      const c = document.createElement('canvas');
      return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
    } catch {
      return false;
    }
  });

  // Mirror the theme-derived emissive factor each render so effects and
  // the rAF loop read the current value.
  emissiveFactorRef.current = theme === 'light' ? 0.5 : 1;

  const track = useCallback((d: { dispose: () => void }) => {
    disposablesRef.current.push(d);
  }, []);

  // Host sizing (the panel is responsive; the canvas needs pixels).
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: host.clientWidth, h: host.clientHeight });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  // prefers-reduced-motion — kills auto-rotate + flow particles.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Theme observation (data-theme flips on <html> without React state).
  // Also re-reads the scene background token so the 3D clear color tracks
  // the theme (PP-07 §1).
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
      setSceneBg(readSceneBg());
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  // Graph data — pinned deterministic 3D layout from the seed angles.
  const graphData = useMemo(() => {
    const positions = computeDomainPositions(domains, DESKTOP_RADII);
    const nodes: GNode[] = [
      {
        id: 'ra',
        ref: { kind: 'ra' },
        label: 'RA',
        color: '#f5d68a',
        kind: 'ra',
        active: true,
        fx: 0,
        fy: 0,
        fz: 0,
      },
    ];
    const links: GLink[] = [];

    domains.forEach((d, i) => {
      const pos = positions[d.slug];
      if (!pos) return;
      const color = domainColor(d.slug);
      nodes.push({
        id: `domain:${d.slug}`,
        ref: { kind: 'domain', slug: d.slug },
        label: d.name,
        color,
        kind: 'domain',
        active: d.active,
        fx: pos.x,
        fy: -pos.y, // SVG y-down → 3D y-up
        fz: DOMAIN_Z[i % DOMAIN_Z.length]!,
      });
      links.push({ source: 'ra', target: `domain:${d.slug}`, color, active: d.active });
    });

    observatories.forEach((o, i) => {
      const dpos = positions[o.domainSlug];
      const base = dpos ?? { x: o.fallbackPosition.x, y: o.fallbackPosition.y };
      const di = domains.findIndex((d) => d.slug === o.domainSlug);
      const dz = DOMAIN_Z[(di >= 0 ? di : i) % DOMAIN_Z.length]!;
      // Observatory color = PARENT DOMAIN color (DL-45); signature
      // accent is secondary emphasis (the ring), applied in the mesh.
      // Guard: real observatories may have an unresolved domain, where
      // domainColor returns a CSS var — fall back to their signature
      // primary so THREE always gets a valid hex.
      const rawColor = domainColor(o.domainSlug);
      const color = rawColor.startsWith('#') ? rawColor : o.signature.primaryColor;
      nodes.push({
        id: `observatory:${o.slug}`,
        ref: { kind: 'observatory', slug: o.slug },
        label: o.title,
        color,
        accent: o.signature.accentColor,
        kind: 'observatory',
        active: true,
        fx: base.x + o.offset.x,
        fy: -(base.y + o.offset.y),
        fz: dz + (i % 2 === 0 ? 34 : -30),
      });
      if (dpos) {
        links.push({
          source: `domain:${o.domainSlug}`,
          target: `observatory:${o.slug}`,
          color,
          active: true,
        });
      }
    });

    return { nodes, links };
  }, [domains, observatories]);

  // Node meshes. Built once per node id; tracked for disposal and for
  // hover/selection emissive updates.
  const nodeThreeObject = useCallback(
    (node: GNode) => {
      const group = new THREE.Group();
      const materials: THREE.MeshStandardMaterial[] = [];
      const base: number[] = [];

      // Glow dialed back (A2): emissive intensities are modest so each
      // node reads as a saturated colored orb with a soft halo, not a
      // white blowout. The bloom pass (below) is also gentler.
      if (node.kind === 'ra') {
        const geo = new THREE.IcosahedronGeometry(16, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: '#e9c169',
          emissive: new THREE.Color('#ffcf66'),
          emissiveIntensity: RA_BASE_EMISSIVE,
          metalness: 0.4,
          roughness: 0.3,
          flatShading: true,
        });
        track(geo);
        track(mat);
        materials.push(mat);
        base.push(RA_BASE_EMISSIVE);
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        // Capture for the vibration loop (A3).
        raMeshRef.current = group;
        raMatRef.current = mat;
      } else if (node.kind === 'domain') {
        const r = node.active ? 7.5 : 6;
        const geo = new THREE.SphereGeometry(r, 24, 24);
        const color = new THREE.Color(node.color);
        if (!node.active) color.lerp(new THREE.Color('#6a6f80'), 0.5);
        const emissive = node.active ? 0.5 : 0.16;
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: emissive,
          roughness: 0.45,
          transparent: true,
          opacity: 1,
        });
        track(geo);
        track(mat);
        materials.push(mat);
        base.push(emissive);
        group.add(new THREE.Mesh(geo, mat));
      } else {
        const geo = new THREE.SphereGeometry(3.6, 20, 20);
        const mat = new THREE.MeshStandardMaterial({
          color: node.color,
          emissive: new THREE.Color(node.color),
          emissiveIntensity: 0.48,
          roughness: 0.45,
          transparent: true,
        });
        track(geo);
        track(mat);
        materials.push(mat);
        base.push(0.48);
        group.add(new THREE.Mesh(geo, mat));
        // VisualSignature accent as secondary emphasis (DL-45).
        if (node.accent) {
          const ringGeo = new THREE.TorusGeometry(5.6, 0.22, 8, 36);
          const ringMat = new THREE.MeshStandardMaterial({
            color: node.accent,
            emissive: new THREE.Color(node.accent),
            emissiveIntensity: 0.38,
            transparent: true,
          });
          track(ringGeo);
          track(ringMat);
          materials.push(ringMat);
          base.push(0.38);
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = Math.PI / 2.4;
          group.add(ring);
        }
      }

      meshesRef.current.set(node.id, { mesh: group, materials, base });
      return group;
    },
    [track],
  );

  // Hover / selection / filter → emissive + opacity updates in place.
  // RA is owned by the vibration loop (A3) when motion is allowed; there
  // we only record its hot state and let the loop apply scale/emissive.
  // Under reduced motion the loop is off, so RA is updated here too.
  useEffect(() => {
    const hotIds = new Set<string>();
    if (hovered) hotIds.add(refId(hovered));
    if (selected) hotIds.add(refId(selected));
    raHotRef.current = hotIds.has('ra');
    const factor = emissiveFactorRef.current;
    for (const node of graphData.nodes) {
      const entry = meshesRef.current.get(node.id);
      if (!entry) continue;
      const hot = hotIds.has(node.id);
      if (node.kind === 'ra' && !reducedMotion) continue;
      const ghost = showActiveOnly && node.kind === 'domain' && !node.active;
      entry.materials.forEach((m, i) => {
        m.emissiveIntensity = (entry.base[i] ?? 0.5) * factor * (hot ? HOT_EMISSIVE : 1);
        m.opacity = ghost ? 0.16 : 1;
      });
      entry.mesh.scale.setScalar(hot ? 1.18 : 1);
    }
  }, [hovered, selected, showActiveOnly, graphData, reducedMotion, theme]);

  // RA vibration pulse (A3) — a gentle continuous breathing so the hub
  // feels alive as a heartbeat. Small amplitude, calm cadence. Disabled
  // under prefers-reduced-motion (RA rests static, still hover-reactive
  // via the effect above). The rAF is cancelled on unmount.
  useEffect(() => {
    if (reducedMotion) {
      // Rest RA at its base state (theme-scaled emissive).
      if (raMeshRef.current) raMeshRef.current.scale.setScalar(1);
      if (raMatRef.current) {
        raMatRef.current.emissiveIntensity = RA_BASE_EMISSIVE * emissiveFactorRef.current;
      }
      return;
    }
    let raf = 0;
    const tick = () => {
      const t = performance.now() / 1000;
      const pulse = Math.sin(t * 1.7); // ~0.27 Hz, calm
      const hot = raHotRef.current;
      if (raMeshRef.current) {
        raMeshRef.current.scale.setScalar((1 + 0.035 * pulse) * (hot ? 1.15 : 1));
      }
      if (raMatRef.current) {
        raMatRef.current.emissiveIntensity =
          RA_BASE_EMISSIVE * emissiveFactorRef.current * (1 + 0.18 * pulse) * (hot ? HOT_EMISSIVE : 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // One-time renderer config once the instance exists: pixel-ratio cap
  // and the bloom pass (the panel's only post-processing).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const fg = fgRef.current;
    if (!fg) return;
    fg.renderer().setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    // Gentler bloom (A2): lower strength + smaller radius + higher
    // threshold so only the brightest cores bloom — soft halos, no
    // white blowout, and the deep background stops washing to grey.
    const pass = new UnrealBloomPass(
      new THREE.Vector2(size.w || 800, size.h || 600),
      theme === 'dark' ? 0.55 : 0.0,
      0.4,
      0.3,
    );
    fg.postProcessingComposer().addPass(pass);
    bloomRef.current = pass;
    return () => {
      const composer = fg.postProcessingComposer?.();
      composer?.removePass?.(pass);
      pass.dispose?.();
      bloomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Theme → bloom strength. The light scene is a literal paper white
  // (PP-07 §1); bloom is disabled there because a near-white background
  // self-blooms into haze. Nodes read as saturated diffuse orbs (emissive
  // is also scaled down on light — see emissiveFactorRef).
  useEffect(() => {
    if (bloomRef.current) {
      bloomRef.current.strength = theme === 'dark' ? 0.55 : 0.0;
    }
  }, [theme]);

  // Auto-rotate (idle life). Off under reduced motion, always.
  useEffect(() => {
    if (!ready) return;
    const controls = fgRef.current?.controls() as
      | { autoRotate: boolean; autoRotateSpeed: number }
      | undefined;
    if (!controls) return;
    controls.autoRotate = autoRotate && !reducedMotion;
    controls.autoRotateSpeed = 0.55;
  }, [ready, autoRotate, reducedMotion]);

  // Real view commands (token-gated).
  const lastTokenRef = useRef(0);
  useEffect(() => {
    if (!viewCommand || viewCommand.token === lastTokenRef.current) return;
    lastTokenRef.current = viewCommand.token;
    const fg = fgRef.current;
    if (!fg) return;
    if (viewCommand.action === 'reset') {
      fg.cameraPosition({ x: 0, y: 0, z: DEFAULT_CAMERA_Z }, { x: 0, y: 0, z: 0 }, 800);
    } else if (viewCommand.action === 'fit') {
      fg.zoomToFit(700, 70);
    } else {
      fg.cameraPosition({ x: 0, y: -30, z: 240 }, { x: 0, y: 0, z: 0 }, 900);
    }
  }, [viewCommand]);

  // Dispose everything on unmount — no WebGL context leaks.
  useEffect(() => {
    const disposables = disposablesRef.current;
    const meshes = meshesRef.current;
    return () => {
      // Intentionally read the LATEST instance at unmount time — the
      // graph mounts after this effect runs, so capturing at setup
      // would grab undefined. fgRef is a library handle, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const fg = fgRef.current;
      try {
        fg?.pauseAnimation();
        fg?.renderer()?.dispose();
      } catch {
        /* renderer already gone */
      }
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          /* ignore */
        }
      });
      disposables.length = 0;
      meshes.clear();
    };
  }, []);

  if (!webglOk) {
    return (
      <div ref={hostRef} className={styles.host}>
        <p className={styles.fallback}>
          The 3D universe needs WebGL, which this browser has disabled.
          The Registry and Inspector still work.
        </p>
      </div>
    );
  }

  return (
    <div ref={hostRef} className={styles.host}>
      {size.w > 0 && size.h > 0 ? (
        <ForceGraph3D
          ref={fgRef as never}
          width={size.w}
          height={size.h}
          graphData={graphData}
          backgroundColor={sceneBg}
          showNavInfo={false}
          enableNodeDrag={false}
          cooldownTicks={0}
          warmupTicks={0}
          nodeThreeObject={nodeThreeObject as never}
          nodeLabel={() => ''}
          linkColor={(l: GLink) => l.color}
          linkOpacity={0.35}
          linkWidth={(l: GLink) => (l.active ? 0.6 : 0.25)}
          linkDirectionalParticles={(l: GLink) =>
            reducedMotion || !l.active ? 0 : 2
          }
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={1.6}
          onNodeClick={(node: GNode) => onSelectEntity(node.ref)}
          onNodeHover={(node: GNode | null) => {
            if (hostRef.current) {
              hostRef.current.style.cursor = node ? 'pointer' : 'grab';
            }
            onHoverEntity(node ? node.ref : null);
          }}
          onBackgroundClick={() => onClearSelect()}
          onEngineStop={() => setReady(true)}
        />
      ) : null}
    </div>
  );
}
