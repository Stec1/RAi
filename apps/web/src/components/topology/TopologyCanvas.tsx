'use client';

// TopologyCanvas — pure-SVG renderer for the Explore topology.
//
// ISSUE-08R.2 hardening (preserved intact):
//   - Native non-passive `wheel` listener with preventDefault() so trackpad
//     pinch (ctrlKey wheel) zooms the canvas instead of scrolling the page.
//   - Pointer-centered zoom via SVG CTM math: the world point under the
//     cursor stays under the cursor while zooming.
//   - Scale-aware pan: drag deltas are converted from screen pixels to
//     viewBox units (1/CTM.a, 1/CTM.d) so motion tracks 1:1 at any zoom.
//   - Light inertial pan tail (~250–400ms ease-out) sampled from the last
//     ~80ms of pointer motion; cancelled on next pointerdown / unmount.
//   - Click-vs-drag distinction via CLICK_MOVE_THRESHOLD.
//
// PATCH-PIVOT-02 — central click dispatch (preserved intact):
// handlePointerDown calls setPointerCapture on the <svg>, and with
// capture held, browsers dispatch the synthesized `click` at the capture
// target — so per-node React onClick handlers NEVER fire from real
// pointer input. The true pointerdown target (captured BEFORE capture
// retargeting applies) is stored in the drag state, and the pointerup
// click-vs-drag branch routes selection centrally from that snapshot.
//
// PATCH-PIVOT-03 (DL-37 amended / DL-38) — visual layer only:
//   - Structural elliptical depth rings render first inside the pan/zoom
//     group (TopologyDepthRings).
//   - `showActiveOnly` filters WHICH nodes/edges render (a real view
//     control, DL-37: no fake actions); positions stay computed from the
//     full set so angles never shift.
//   - `viewCommand` executes real view actions: reset (identity), fit
//     (frame all visible nodes), focus (center the hub).

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import { TopologyRA } from './TopologyRA';
import { TopologyDomains } from './TopologyDomains';
import { TopologyConnections } from './TopologyConnections';
import { TopologyDepthRings } from './TopologyDepthRings';
import {
  TopologyObservatories,
  type ObservatoryOnCanvas,
} from './TopologyObservatories';
import type { MockObservatory } from '../../data/mock-observatories';
import {
  DESKTOP_RADII,
  MOBILE_MAX_WIDTH,
  MOBILE_RADII,
  computeDomainPositions,
  type DomainSeed,
} from './topology-layout';

// A reference to any selectable entity on the canvas. Shared with the
// terminal's Registry/Inspector selection model.
export type EntityRef =
  | { kind: 'ra' }
  | { kind: 'domain'; slug: string }
  | { kind: 'observatory'; slug: string };

// Real view actions for the topology panel's pill controls (DL-37:
// controls are real — no AI/data-mutation actions exist here).
export type ViewCommand = {
  action: 'reset' | 'fit' | 'focus';
  token: number;
};

const OBSERVATORY_SLUG_PREFIX = 'observatory:';

function entityFromSlugAttr(slugAttr: string): EntityRef {
  if (slugAttr === 'ra') return { kind: 'ra' };
  if (slugAttr.startsWith(OBSERVATORY_SLUG_PREFIX)) {
    return {
      kind: 'observatory',
      slug: slugAttr.slice(OBSERVATORY_SLUG_PREFIX.length),
    };
  }
  return { kind: 'domain', slug: slugAttr };
}

interface Props {
  domains: DomainSeed[];
  observatories: MockObservatory[];
  hovered: EntityRef | null;
  selected: EntityRef | null;
  onHoverEntity: (ref: EntityRef | null) => void;
  onSelectEntity: (ref: EntityRef) => void;
  onClearSelect: () => void;
  /** Reports the current zoom factor after wheel/pinch/command changes. */
  onViewChange?: (zoom: number) => void;
  /** Real view actions (reset / fit / focus); executed on token change. */
  viewCommand?: ViewCommand;
  /** Render filter: active domains (and their observatories) only. */
  showActiveOnly?: boolean;
}

// Zoom range and step constants. Wheel deltas use a small exponential step
// so a single notch on a mouse wheel and a slow trackpad swipe both feel
// natural. ctrlKey-modified wheel events (synthetic pinch on macOS) use a
// larger step because pinch gestures emit many small deltas.
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const WHEEL_STEP = 0.0015;
const PINCH_STEP = 0.01;

// Pixels of total pointer travel below which a pointerup is considered a
// click rather than a drag. 3px is conservative — fits both mouse jitter
// and finger taps on touch.
const CLICK_MOVE_THRESHOLD = 3;

// Inertia: sample velocity over a short trailing window, then decay each
// frame. Tuned for ~250–400ms of glide on a moderate flick.
const VELOCITY_WINDOW_MS = 80;
const INERTIA_DECAY = 0.92;
const INERTIA_MIN_VELOCITY = 0.02; // viewBox units per ms
const INERTIA_MIN_KICK = 0.4 / 16; // ~ 0.4 px/frame at 60Hz, in vb units/ms

// Fit: padding around the node bounding box, in viewBox units — covers
// node labels (which extend below and to the sides of each node).
const FIT_PADDING = 80;

type Pan = { x: number; y: number };

type DragState = {
  pointerId: number;
  // Screen-space anchor for click-vs-drag detection.
  startClientX: number;
  startClientY: number;
  // viewBox-units pan at drag start, used as the basis for the live pan.
  startPan: Pan;
  // Last screen-pixel coords seen, for incremental velocity sampling.
  lastClientX: number;
  lastClientY: number;
  lastTimestamp: number;
  // Cached screen→viewBox scale captured at drag start. The CTM is stable
  // for the duration of a drag, so we don't have to re-read it every move.
  viewBoxPerPixelX: number;
  viewBoxPerPixelY: number;
  // Velocity samples (viewBox units / ms), trimmed to VELOCITY_WINDOW_MS.
  samples: Array<{ t: number; vx: number; vy: number }>;
  // Accumulated total movement in screen pixels (for click-vs-drag).
  totalDxScreen: number;
  totalDyScreen: number;
  // data-slug of the node under the ORIGINAL pointerdown target, or null
  // for canvas background. Captured before pointer capture retargets
  // subsequent events; this is the click-dispatch source of truth.
  startSlug: string | null;
};

export function TopologyCanvas({
  domains,
  observatories,
  hovered,
  selected,
  onHoverEntity,
  onSelectEntity,
  onClearSelect,
  onViewChange,
  viewCommand,
  showActiveOnly = false,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const innerGroupRef = useRef<SVGGElement | null>(null);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Mirror current pan/zoom into refs so the native wheel listener (which
  // is registered once) reads fresh values without re-subscribing.
  const panRef = useRef<Pan>(pan);
  const zoomRef = useRef<number>(zoom);
  panRef.current = pan;
  zoomRef.current = zoom;

  // Mirror onViewChange so the wheel listener never re-registers when the
  // parent passes a fresh callback identity.
  const onViewChangeRef = useRef<Props['onViewChange']>(onViewChange);
  onViewChangeRef.current = onViewChange;

  const dragRef = useRef<DragState | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);

  // Track viewport size to pick the appropriate ring radii.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Positions are always computed from the FULL domain set so seed angles
  // never shift when the render filter changes.
  const positions = useMemo(
    () =>
      computeDomainPositions(domains, isMobile ? MOBILE_RADII : DESKTOP_RADII),
    [domains, isMobile],
  );

  // Render filter (DL-37 pill control): active domains and the
  // observatories that belong to them.
  const visibleDomains = useMemo(
    () => (showActiveOnly ? domains.filter((d) => d.active) : domains),
    [domains, showActiveOnly],
  );
  const visibleObservatories = useMemo(() => {
    if (!showActiveOnly) return observatories;
    const activeSlugs = new Set(
      domains.filter((d) => d.active).map((d) => d.slug),
    );
    return observatories.filter((o) => activeSlugs.has(o.domainSlug));
  }, [observatories, domains, showActiveOnly]);

  // Observatory nodes settle at a fixed offset from their domain. If the
  // domain is missing from the fetched payload, or any coordinate is
  // non-finite, the node falls back to its defined fixed coordinate —
  // an observatory is never dropped and never lands on NaN.
  const observatoryNodes = useMemo<ObservatoryOnCanvas[]>(() => {
    return visibleObservatories.map((observatory) => {
      const rawDomain = positions[observatory.domainSlug] ?? null;
      const domainPosition =
        rawDomain &&
        Number.isFinite(rawDomain.x) &&
        Number.isFinite(rawDomain.y)
          ? rawDomain
          : null;
      const derived = domainPosition
        ? {
            x: domainPosition.x + observatory.offset.x,
            y: domainPosition.y + observatory.offset.y,
          }
        : observatory.fallbackPosition;
      const position =
        Number.isFinite(derived.x) && Number.isFinite(derived.y)
          ? derived
          : observatory.fallbackPosition;
      return { observatory, position, domainPosition };
    });
  }, [visibleObservatories, positions]);

  const cancelInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

  // Real view commands from the panel's pill controls. Token-gated so the
  // effect only acts on an actual dispatch, never on data changes.
  const lastViewTokenRef = useRef(0);
  useEffect(() => {
    if (!viewCommand || viewCommand.token === lastViewTokenRef.current) return;
    lastViewTokenRef.current = viewCommand.token;
    cancelInertia();

    let nextZoom = 1;
    let nextPan: Pan = { x: 0, y: 0 };

    if (viewCommand.action === 'focus') {
      // Center and scale to the hub.
      nextZoom = 1.6;
    } else if (viewCommand.action === 'fit') {
      // Frame all visible nodes (hub + domains + observatories).
      let minX = 0;
      let maxX = 0;
      let minY = 0;
      let maxY = 0;
      for (const d of visibleDomains) {
        const pos = positions[d.slug];
        if (!pos) continue;
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minY = Math.min(minY, pos.y);
        maxY = Math.max(maxY, pos.y);
      }
      for (const node of observatoryNodes) {
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y);
      }
      const width = maxX - minX + FIT_PADDING * 2;
      const height = maxY - minY + FIT_PADDING * 2;
      nextZoom = Math.max(
        ZOOM_MIN,
        Math.min(ZOOM_MAX, Math.min(1000 / width, 800 / height)),
      );
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      nextPan = { x: -centerX * nextZoom, y: -centerY * nextZoom };
    }

    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    setZoom(nextZoom);
    setPan(nextPan);
    onViewChangeRef.current?.(nextZoom);
  }, [viewCommand, cancelInertia, visibleDomains, positions, observatoryNodes]);

  // Native wheel listener. React's onWheel is registered as passive in
  // some browsers, which means preventDefault() is a no-op there — letting
  // the trackpad pinch escape and scroll the page. Attaching directly with
  // { passive: false } is the only reliable fix.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      // Stop the wheel from bubbling to outer scroll containers; we own
      // every wheel inside the canvas.
      event.stopPropagation();

      cancelInertia();

      const inner = innerGroupRef.current;
      if (!inner) return;
      const ctm = inner.getScreenCTM();
      if (!ctm) return;

      // World coords under the cursor BEFORE zooming.
      const inverse = ctm.inverse();
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const before = pt.matrixTransform(inverse);

      const step = event.ctrlKey ? PINCH_STEP : WHEEL_STEP;
      const factor = Math.exp(-event.deltaY * step);
      const prevZoom = zoomRef.current;
      const nextZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prevZoom * factor));

      if (nextZoom === prevZoom) return; // clamped — no-op

      // Pointer-centered zoom: keep the viewBox-space point under the
      // cursor invariant. The transform is `translate(pan) scale(zoom)`,
      // so screen-to-world is `world = (screen - pan) / zoom`. Holding
      // `world` constant gives `newPan = screen - world * newZoom`.
      const prevPan = panRef.current;
      const newPanX = prevPan.x + (prevZoom - nextZoom) * before.x;
      const newPanY = prevPan.y + (prevZoom - nextZoom) * before.y;

      // Update refs synchronously so a burst of wheel events (e.g. 120Hz
      // trackpad) all read the latest computed zoom/pan, not the stale
      // value from the last committed render.
      zoomRef.current = nextZoom;
      panRef.current = { x: newPanX, y: newPanY };

      setZoom(nextZoom);
      setPan({ x: newPanX, y: newPanY });
      onViewChangeRef.current?.(nextZoom);
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [cancelInertia]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      cancelInertia();

      // Snapshot the true target BEFORE capture retargeting applies —
      // this is the only reliable node reference for click dispatch.
      const target = event.target as Element | null;
      const startSlug =
        target?.closest('[data-slug]')?.getAttribute('data-slug') ?? null;

      // Cache the screen→viewBox scale once at drag start. CTM is stable
      // during a drag (no zoom changes mid-drag in this implementation).
      const inner = innerGroupRef.current;
      const ctm = inner?.getScreenCTM();
      const viewBoxPerPixelX = ctm && ctm.a !== 0 ? 1 / ctm.a : 1;
      const viewBoxPerPixelY = ctm && ctm.d !== 0 ? 1 / ctm.d : 1;

      try {
        svgRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // Capture can fail if the element has been removed; non-fatal.
      }

      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPan: panRef.current,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
        lastTimestamp: event.timeStamp,
        viewBoxPerPixelX,
        viewBoxPerPixelY,
        samples: [],
        totalDxScreen: 0,
        totalDyScreen: 0,
        startSlug,
      };
    },
    [cancelInertia],
  );

  const handlePointerMove = useCallback((event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    // Total drag delta from start, in screen pixels.
    const dxStart = event.clientX - drag.startClientX;
    const dyStart = event.clientY - drag.startClientY;
    drag.totalDxScreen = dxStart;
    drag.totalDyScreen = dyStart;

    // Convert screen-pixel delta to viewBox-space pan delta. Since the
    // base transform is `translate(pan) scale(zoom)`, panning by N viewBox
    // units shifts content by N * zoom screen pixels — and `1/ctm.a`
    // already encodes that scale, so we don't divide by zoom again.
    const panDxV = dxStart * drag.viewBoxPerPixelX;
    const panDyV = dyStart * drag.viewBoxPerPixelY;
    setPan({ x: drag.startPan.x + panDxV, y: drag.startPan.y + panDyV });

    // Velocity sample: incremental viewBox units / ms over this frame.
    const dt = event.timeStamp - drag.lastTimestamp;
    if (dt > 0) {
      const incDx = (event.clientX - drag.lastClientX) * drag.viewBoxPerPixelX;
      const incDy = (event.clientY - drag.lastClientY) * drag.viewBoxPerPixelY;
      drag.samples.push({ t: event.timeStamp, vx: incDx / dt, vy: incDy / dt });
      // Trim old samples outside the rolling window.
      const cutoff = event.timeStamp - VELOCITY_WINDOW_MS;
      while (drag.samples.length && drag.samples[0]!.t < cutoff) {
        drag.samples.shift();
      }
    }
    drag.lastClientX = event.clientX;
    drag.lastClientY = event.clientY;
    drag.lastTimestamp = event.timeStamp;
  }, []);

  const startInertia = useCallback((vx: number, vy: number) => {
    cancelInertia();
    let velX = vx;
    let velY = vy;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.max(1, now - lastTs);
      lastTs = now;
      // setPan with a functional update so we don't read stale state.
      setPan((prev) => ({ x: prev.x + velX * dt, y: prev.y + velY * dt }));
      // Per-frame decay (frame-rate independent enough for short tails).
      const decay = Math.pow(INERTIA_DECAY, dt / 16);
      velX *= decay;
      velY *= decay;
      if (Math.hypot(velX, velY) < INERTIA_MIN_VELOCITY) {
        inertiaFrameRef.current = null;
        return;
      }
      inertiaFrameRef.current = requestAnimationFrame(tick);
    };
    inertiaFrameRef.current = requestAnimationFrame(tick);
  }, [cancelInertia]);

  const handlePointerUp = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      try {
        svgRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        // No capture in flight — safe to ignore.
      }
      dragRef.current = null;

      const moved = Math.hypot(drag.totalDxScreen, drag.totalDyScreen);

      if (moved < CLICK_MOVE_THRESHOLD) {
        // Treated as a click. Central dispatch from the pointerdown
        // snapshot: the pointerup/click targets are the capturing <svg>,
        // so per-node handlers can't be trusted here.
        if (drag.startSlug) {
          onSelectEntity(entityFromSlugAttr(drag.startSlug));
        } else {
          onClearSelect();
        }
        return;
      }

      // Real drag — compute trailing velocity and launch inertia if it's
      // above the launch threshold. Average the windowed samples.
      if (drag.samples.length === 0) return;
      let sumVx = 0;
      let sumVy = 0;
      for (const s of drag.samples) {
        sumVx += s.vx;
        sumVy += s.vy;
      }
      const vx = sumVx / drag.samples.length;
      const vy = sumVy / drag.samples.length;
      if (Math.hypot(vx, vy) >= INERTIA_MIN_KICK) {
        startInertia(vx, vy);
      }
    },
    [onClearSelect, onSelectEntity, startInertia],
  );

  const handlePointerCancel = useCallback((event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    try {
      svgRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = null;
  }, []);

  // Cancel any in-flight inertia on unmount.
  useEffect(() => {
    return () => {
      if (inertiaFrameRef.current !== null) {
        cancelAnimationFrame(inertiaFrameRef.current);
        inertiaFrameRef.current = null;
      }
    };
  }, []);

  const hoveredDomainSlug = hovered?.kind === 'domain' ? hovered.slug : null;
  const selectedDomainSlug = selected?.kind === 'domain' ? selected.slug : null;
  const hoveredObservatorySlug =
    hovered?.kind === 'observatory' ? hovered.slug : null;
  const selectedObservatorySlug =
    selected?.kind === 'observatory' ? selected.slug : null;
  const raHot = hovered?.kind === 'ra' || selected?.kind === 'ra';

  return (
    <svg
      ref={svgRef}
      viewBox="-500 -400 1000 800"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-label="The RAI universe"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      {/* Transparent background rect — gives the SVG a hit area across the
          full viewport so pointerdown on empty space starts a pan. */}
      <rect
        x={-5000}
        y={-5000}
        width={10000}
        height={10000}
        fill="transparent"
        pointerEvents="all"
      />
      <g
        ref={innerGroupRef}
        transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}
      >
        <TopologyDepthRings />
        <TopologyConnections
          domains={visibleDomains}
          positions={positions}
          hoveredSlug={hoveredDomainSlug}
          selectedSlug={selectedDomainSlug}
        />
        <TopologyDomains
          domains={visibleDomains}
          positions={positions}
          hoveredSlug={hoveredDomainSlug}
          selectedSlug={selectedDomainSlug}
          onHover={(slug) =>
            onHoverEntity(slug ? { kind: 'domain', slug } : null)
          }
          onSelect={(slug) => onSelectEntity({ kind: 'domain', slug })}
        />
        <TopologyObservatories
          nodes={observatoryNodes}
          hoveredSlug={hoveredObservatorySlug}
          selectedSlug={selectedObservatorySlug}
          onHover={(slug) =>
            onHoverEntity(slug ? { kind: 'observatory', slug } : null)
          }
          onSelect={(slug) => onSelectEntity({ kind: 'observatory', slug })}
        />
        <TopologyRA
          hot={raHot}
          onHoverChange={(hovering) =>
            onHoverEntity(hovering ? { kind: 'ra' } : null)
          }
          onSelect={() => onSelectEntity({ kind: 'ra' })}
        />
      </g>
    </svg>
  );
}
