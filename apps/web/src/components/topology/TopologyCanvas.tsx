'use client';

// TopologyCanvas — pure-SVG renderer for the /explore intelligence topology.
//
// ISSUE-08R.2 hardening:
//   - Native non-passive `wheel` listener with preventDefault() so trackpad
//     pinch (ctrlKey wheel) zooms the canvas instead of scrolling the page.
//   - Pointer-centered zoom via SVG CTM math: the world point under the
//     cursor stays under the cursor while zooming.
//   - Scale-aware pan: drag deltas are converted from screen pixels to
//     viewBox units (1/CTM.a, 1/CTM.d) so motion tracks 1:1 at any zoom.
//   - Light inertial pan tail (~250–400ms ease-out) sampled from the last
//     ~80ms of pointer motion; cancelled on next pointerdown / unmount.
//   - Click-vs-drag distinction: the click-to-clear-selection behaviour
//     only fires when total pointer movement is below CLICK_MOVE_THRESHOLD;
//     drags never inadvertently clear the selection.
//
// All other rendering (RA glyph, domain nodes, connection lines) stays
// intact — only the interaction layer changes.
//
// PATCH-PIVOT-01 (DL-31/DL-33): the canvas is now the living universe —
// it additionally renders an ambient starfield behind the graph and
// observatory nodes near their domains. The interaction layer above is
// untouched; observatory groups carry data-slug so click-vs-drag keeps
// treating them as nodes.

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
import { TopologyStarfield } from './TopologyStarfield';
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

interface Props {
  domains: DomainSeed[];
  observatories: MockObservatory[];
  hoveredSlug: string | null;
  selectedSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  onClearSelect: () => void;
  onOpenObservatory: (slug: string) => void;
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
const INERTIA_MIN_KICK = 0.4 / 16; // ~ 0.4 px/frame at 60Hz, in vb units/ms — see launch check

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
  // Whether the pointer started over the canvas background (vs a node).
  startedOnBackground: boolean;
};

export function TopologyCanvas({
  domains,
  observatories,
  hoveredSlug,
  selectedSlug,
  onHover,
  onSelect,
  onClearSelect,
  onOpenObservatory,
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

  const positions = useMemo(
    () =>
      computeDomainPositions(domains, isMobile ? MOBILE_RADII : DESKTOP_RADII),
    [domains, isMobile],
  );

  // Observatory nodes settle at a fixed offset from their domain. An
  // observatory whose domain isn't in the fetched set simply doesn't
  // render — no orphan nodes.
  const observatoryNodes = useMemo<ObservatoryOnCanvas[]>(() => {
    const out: ObservatoryOnCanvas[] = [];
    for (const observatory of observatories) {
      const domainPosition = positions[observatory.domainSlug];
      if (!domainPosition) continue;
      out.push({
        observatory,
        domainPosition,
        position: {
          x: domainPosition.x + observatory.offset.x,
          y: domainPosition.y + observatory.offset.y,
        },
      });
    }
    return out;
  }, [observatories, positions]);

  // Convert screen coords to inner-group (viewBox) coords using the live
  // CTM. Returns null if the SVG hasn't laid out yet.
  const screenToInner = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const inner = innerGroupRef.current;
      const svg = svgRef.current;
      if (!inner || !svg) return null;
      const ctm = inner.getScreenCTM();
      if (!ctm) return null;
      const inverse = ctm.inverse();
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const world = pt.matrixTransform(inverse);
      return { x: world.x, y: world.y };
    },
    [],
  );

  const cancelInertia = useCallback(() => {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }, []);

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

      // World coords under the cursor BEFORE zooming. Reusing screenToInner
      // would re-fetch the CTM; we already have it, so do the math inline.
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
      // Using the cached `before` (computed via the full CTM) handles
      // the SVG viewBox→client mapping correctly.
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
    };

    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [cancelInertia]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      cancelInertia();

      const target = event.target as Element | null;
      const startedOnBackground = !target?.closest('[data-slug]');

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
        startedOnBackground,
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
        // Treated as a click. Only clear selection if the click landed on
        // the canvas background — clicking a node is handled by the node.
        if (drag.startedOnBackground) {
          const target = event.target as Element | null;
          if (!target?.closest('[data-slug]')) {
            onClearSelect();
          }
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
    [onClearSelect, startInertia],
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

  // Avoid an unused-import warning while keeping screenToInner available
  // for future hit-testing logic without re-introducing it later.
  void screenToInner;

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
          full viewport so pointerdown on empty space starts a pan. The
          click-to-clear-selection logic now lives in handlePointerUp so
          drags never accidentally clear. */}
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
        <TopologyStarfield />
        <TopologyConnections
          domains={domains}
          positions={positions}
          hoveredSlug={hoveredSlug}
          selectedSlug={selectedSlug}
        />
        <TopologyDomains
          domains={domains}
          positions={positions}
          hoveredSlug={hoveredSlug}
          selectedSlug={selectedSlug}
          onHover={onHover}
          onSelect={onSelect}
        />
        <TopologyObservatories
          nodes={observatoryNodes}
          onOpen={onOpenObservatory}
        />
        <TopologyRA />
      </g>
    </svg>
  );
}
