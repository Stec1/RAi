'use client';

// TopologyGraph3D — the Explore topology as a real WebGL 3D graph
// (PATCH-PIVOT-05, DL-43/DL-44/DL-45), rendered with react-force-graph-3d
// (Three.js) INSIDE the existing framed Topology panel.
//
// Loaded ONLY via next/dynamic with ssr:false (see RaiTerminal) so the
// three/react-force-graph footprint never runs on the server and stays
// code-split to the Explore surface.
//
// Scene contract (GENESIS R-01 interim — one universe, engine unchanged):
//   • RA — faceted gold crystal at the sphere's CENTER (origin).
//   • Worlds (PUBLIC observatories) — orbs on the OUTER shell, placed
//     deterministically on the golden-spiral lattice by a hash of their
//     name (domain bias died with the domains, R-DL-02/R-DL-10).
//   • Node color = the world's VisualSignature primary (R-DL-10) with a
//     neutral fallback; the signature accent rings the orb.
//   • Edges — thin RA→world tethers only.
//   • A visible lat/long sphere shell marks the boundary (DL-50).
//   • No persistent in-scene labels — identity via Inspector + Registry.
//     Dark scene background is TRUE BLACK (DL-50).
//   • Positions are DETERMINISTIC and pinned (fx/fy/fz); the force sim is
//     frozen (cooldownTicks/warmupTicks = 0) — same data → same layout.
//   • Camera uses OrbitControls with a clamped dolly so the viewer can
//     zoom INSIDE the shell and look outward (DL-50).
//   The full-screen meta-graph + new spatial model arrive at R-03.
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
import type { EntityRef, ViewCommand, World } from '../../lib/topology-types';
import styles from './TopologyGraph3D.module.css';

interface Props {
  worlds: World[];
  hovered: EntityRef | null;
  selected: EntityRef | null;
  onHoverEntity: (ref: EntityRef | null) => void;
  onSelectEntity: (ref: EntityRef) => void;
  onClearSelect: () => void;
  viewCommand?: ViewCommand;
  autoRotate?: boolean;
}

type GNode = {
  id: string;
  ref: EntityRef;
  label: string;
  color: string;
  accent?: string;
  kind: 'ra' | 'observatory';
  fx: number;
  fy: number;
  fz: number;
};

type GLink = {
  source: string;
  target: string;
  color: string;
};

// ── Bounded spherical universe (DL-50, de-domained at GENESIS R-01) ──
// RA at the origin; worlds on the OUTER shell (the sphere surface).
// Positions are deterministic (golden-spiral lattice slot from a name
// hash), pinned via fx/fy/fz with the force sim frozen — same data →
// same layout, and a world keeps its place as others join (R-DL-10).
const R_SHELL = 300; // outer shell (worlds + the visible boundary)
const DEFAULT_CAM = 720; // frames the whole sphere from outside
const MIN_DIST = 24; // dolly clamp: can go INSIDE the shell, never past RA
const MAX_DIST = 1200; // dolly clamp: never fly infinitely away
const FOCUS_CAM = 120; // Focus RA — near the center, looking out
// Golden-spiral lattice size: hash picks a slot, so a world's position
// depends only on its own name (997 slots ≫ MVP world counts; prime to
// spread hash residues).
const SHELL_SLOTS = 997;

// RA hub base emissive (A2) — brightest node but shows its gold, not a
// white core. The vibration loop (A3) modulates around this.
const RA_BASE_EMISSIVE = 0.7;
// Hover/selection emissive multiplier — brighten without blowing out.
const HOT_EMISSIVE = 1.7;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// Fibonacci-sphere unit direction for index i of n — spreads points evenly
// over the sphere (not on a flat ring), deterministic by index.
function fibDir(i: number, n: number): THREE.Vector3 {
  const y = n <= 1 ? 0 : 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * i;
  return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

// Deterministic [0,1) pair from a string (FNV-1a) — stable across reloads.
function hash01(seed: string): [number, number] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = ((h >>> 0) % 100000) / 100000;
  h = Math.imul(h ^ (h >>> 13), 16777619);
  const v = ((h >>> 0) % 100000) / 100000;
  return [u, v];
}

// A world's deterministic shell direction: its name hash picks a slot on
// the golden-spiral lattice. Independent of every other world — a new
// world never reshuffles the sky (R-DL-10 interim placement until R-03).
function shellDir(name: string): THREE.Vector3 {
  const [u] = hash01(name);
  return fibDir(Math.floor(u * SHELL_SLOTS), SHELL_SLOTS);
}

// The visible sphere boundary (PP-09 §3) — a clean lat/long globe of thin
// lines (no triangle diagonals), added directly to the scene. Subtle, so
// nodes dominate; theme-colored via the returned material.
function buildSphereShell(radius: number): {
  group: THREE.Group;
  material: THREE.LineBasicMaterial;
  dispose: () => void;
} {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x38507a,
    transparent: true,
    opacity: 0.2,
  });
  const geometries: THREE.BufferGeometry[] = [];
  const SEG = 96;
  for (const latDeg of [-60, -35, -12, 12, 35, 60]) {
    const lat = (latDeg * Math.PI) / 180;
    const y = radius * Math.sin(lat);
    const rr = radius * Math.cos(lat);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEG; i += 1) {
      const t = (i / SEG) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rr, y, Math.sin(t) * rr));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    geometries.push(g);
    group.add(new THREE.Line(g, material));
  }
  const MER = 8;
  for (let m = 0; m < MER; m += 1) {
    const rot = (m / MER) * Math.PI;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEG; i += 1) {
      const t = (i / SEG) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.sin(t) * Math.cos(rot) * radius,
          Math.cos(t) * radius,
          Math.sin(t) * Math.sin(rot) * radius,
        ),
      );
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    geometries.push(g);
    group.add(new THREE.Line(g, material));
  }
  return {
    group,
    material,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
  };
}

// Scene background follows the ACTIVE theme (PP-09 §5, superseding the
// PP-07 token-only rule): dark is TRUE BLACK — the prior --surface-canvas
// (#050509) carried a faint blue tint that read as lilac under bloom. Light
// reads the paper canvas token. Reacts to data-theme without reload.
function readSceneBg(theme: 'dark' | 'light'): string {
  if (theme === 'dark') return '#000000';
  if (typeof window === 'undefined') return '#efeee9';
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--surface-canvas')
    .trim();
  return v || '#efeee9';
}

function refId(ref: EntityRef): string {
  return ref.kind === 'ra' ? 'ra' : `${ref.kind}:${ref.slug}`;
}

// PATCH-PIVOT-07 §2: persistent in-scene node labels were removed. Node
// identity now lives only in the docked Inspector (on hover/selection)
// and the Registry rail. The graph shows glowing orbs + edges only; hover
// still highlights the node (scale/emissive) so it reads as interactive.

export default function TopologyGraph3D({
  worlds,
  hovered,
  selected,
  onHoverEntity,
  onSelectEntity,
  onClearSelect,
  viewCommand,
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
  // Scene clear color (PP-09 §5): true black in dark, paper in light.
  const [sceneBg, setSceneBg] = useState<string>('#000000');
  // Sphere shell refs (PP-09 §3) — added to the scene, disposed on unmount.
  const shellRef = useRef<THREE.Group | null>(null);
  const shellMatRef = useRef<THREE.LineBasicMaterial | null>(null);

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
  // Measure synchronously at mount — ResizeObserver's initial delivery is
  // frame-aligned and can be arbitrarily late in a background/hidden tab,
  // which would leave the graph unmounted behind a 0×0 gate. The observer
  // then tracks real resizes.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => setSize({ w: host.clientWidth, h: host.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
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
      const t = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setTheme(t);
      setSceneBg(readSceneBg(t));
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  // Graph data — DETERMINISTIC spherical layout (DL-50, R-01 interim).
  // RA at the origin; each PUBLIC world on the outer shell at its hash-
  // picked golden-spiral slot, colored by its own VisualSignature
  // (R-DL-10). All positions are pinned (fx/fy/fz) and the force sim is
  // frozen (cooldownTicks/warmupTicks = 0), so the same data lays out
  // identically every load.
  const graphData = useMemo(() => {
    const nodes: GNode[] = [
      {
        id: 'ra',
        ref: { kind: 'ra' },
        label: 'RA',
        color: '#f5d68a',
        kind: 'ra',
        fx: 0,
        fy: 0,
        fz: 0,
      },
    ];
    const links: GLink[] = [];

    worlds.forEach((w) => {
      const p = shellDir(w.name).multiplyScalar(R_SHELL);
      const color = w.signature.primaryColor.startsWith('#')
        ? w.signature.primaryColor
        : '#8890a8';
      nodes.push({
        id: `observatory:${w.slug}`,
        ref: { kind: 'observatory', slug: w.slug },
        label: w.title,
        color,
        accent: w.signature.accentColor,
        kind: 'observatory',
        fx: p.x,
        fy: p.y,
        fz: p.z,
      });
      // Thin RA→world tether — every world visibly originates at the
      // center (concept.md §3).
      links.push({ source: 'ra', target: `observatory:${w.slug}`, color });
    });

    return { nodes, links };
  }, [worlds]);

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

  // Hover / selection → emissive updates in place. RA is owned by the
  // vibration loop (A3) when motion is allowed; there we only record its
  // hot state and let the loop apply scale/emissive. Under reduced motion
  // the loop is off, so RA is updated here too.
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
      entry.materials.forEach((m, i) => {
        m.emissiveIntensity = (entry.base[i] ?? 0.5) * factor * (hot ? HOT_EMISSIVE : 1);
      });
      entry.mesh.scale.setScalar(hot ? 1.18 : 1);
    }
  }, [hovered, selected, graphData, reducedMotion, theme]);

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

  // Sphere shell (PP-09 §3) + camera framing/clamp. Once the graph is
  // ready: add the lat/long globe to the scene, frame the whole sphere
  // from outside, and clamp OrbitControls so the viewer can dolly INSIDE
  // the shell (down to MIN_DIST, never past RA) but not fly away past
  // MAX_DIST. The shell + its geometries/material are disposed on cleanup.
  useEffect(() => {
    if (!ready) return;
    const fg = fgRef.current;
    if (!fg) return;

    const shell = buildSphereShell(R_SHELL);
    shellRef.current = shell.group;
    shellMatRef.current = shell.material;
    fg.scene().add(shell.group);

    fg.cameraPosition({ x: 0, y: 0, z: DEFAULT_CAM }, { x: 0, y: 0, z: 0 }, 0);
    const controls = fg.controls() as
      | { minDistance?: number; maxDistance?: number }
      | undefined;
    if (controls) {
      controls.minDistance = MIN_DIST;
      controls.maxDistance = MAX_DIST;
    }

    return () => {
      try {
        fg.scene().remove(shell.group);
      } catch {
        /* scene already gone */
      }
      shell.dispose();
      shellRef.current = null;
      shellMatRef.current = null;
    };
  }, [ready]);

  // Scene background must update LIVE on theme flip (PP-09 §5). The
  // library's backgroundColor prop only applies at mount, so set the
  // scene background + renderer clear color imperatively whenever the
  // theme-derived color changes (and once on ready).
  useEffect(() => {
    if (!ready) return;
    const fg = fgRef.current;
    if (!fg) return;
    const col = new THREE.Color(sceneBg);
    fg.scene().background = col;
    try {
      fg.renderer().setClearColor(col, 1);
    } catch {
      /* renderer not ready */
    }
  }, [ready, sceneBg]);

  // Shell color follows the theme — luminous cool line on the black scene,
  // soft ink on paper.
  useEffect(() => {
    const mat = shellMatRef.current;
    if (!mat) return;
    if (theme === 'dark') {
      mat.color.set('#3a4f7a');
      mat.opacity = 0.22;
    } else {
      mat.color.set('#5a5f70');
      mat.opacity = 0.16;
    }
  }, [theme, ready]);

  // Auto-rotate (idle life). Off under reduced motion, always. OrbitControls
  // owns autoRotate; the library's render loop calls controls.update().
  useEffect(() => {
    if (!ready) return;
    const controls = fgRef.current?.controls() as
      | { autoRotate: boolean; autoRotateSpeed: number }
      | undefined;
    if (!controls) return;
    controls.autoRotate = autoRotate && !reducedMotion;
    controls.autoRotateSpeed = 0.45;
  }, [ready, autoRotate, reducedMotion]);

  // Real view commands (token-gated).
  const lastTokenRef = useRef(0);
  useEffect(() => {
    if (!viewCommand || viewCommand.token === lastTokenRef.current) return;
    lastTokenRef.current = viewCommand.token;
    const fg = fgRef.current;
    if (!fg) return;
    if (viewCommand.action === 'reset') {
      // Default outside framing of the whole sphere.
      fg.cameraPosition({ x: 0, y: 0, z: DEFAULT_CAM }, { x: 0, y: 0, z: 0 }, 800);
    } else if (viewCommand.action === 'fit') {
      fg.zoomToFit(700, 60);
    } else {
      // Focus RA — fly to just outside the center, looking out.
      fg.cameraPosition({ x: 0, y: 0, z: FOCUS_CAM }, { x: 0, y: 0, z: 0 }, 900);
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
          // OrbitControls give a clamped dolly (min/max distance → zoom
          // INSIDE the shell but never past RA), orbit, pan, and autoRotate.
          controlType="orbit"
          nodeThreeObject={nodeThreeObject as never}
          nodeLabel={() => ''}
          linkColor={(l: GLink) => l.color}
          linkOpacity={0.35}
          linkWidth={() => 0.6}
          linkDirectionalParticles={() => (reducedMotion ? 0 : 2)}
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
