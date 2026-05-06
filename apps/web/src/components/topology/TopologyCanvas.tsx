'use client';

// TopologyCanvas — pure-SVG renderer for the /explore intelligence topology.
//
// Per DL-26: replaces the prior R3F + PNG-plane implementation with a clean
// Obsidian-like graph (RA core, 7 Domain nodes on two rings, RA→Domain
// lines). The mini-map and observatory-node components are deliberately
// left on disk (kept for ISSUE-09 / ISSUE-10) but are NOT imported here.
//
// Pan: pointerdown → drag updates `pan` state; pointerup releases capture.
//   Momentum/inertia is intentionally deferred (the spec explicitly
//   permits a static drag without inertia for ISSUE-08R).
// Zoom: wheel deltas map to a multiplicative zoom factor, clamped to
//   [0.5, 2.0]. Pinch zoom is intentionally deferred for this issue;
//   the bottom hint copy still references "Pinch to zoom" per docs.
// Clear-selection: a transparent <rect> background OUTSIDE the
//   transformed <g> catches clicks that miss every node.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';

import { TopologyRA } from './TopologyRA';
import { TopologyDomains } from './TopologyDomains';
import { TopologyConnections } from './TopologyConnections';
import {
  DESKTOP_RADII,
  MOBILE_MAX_WIDTH,
  MOBILE_RADII,
  computeDomainPositions,
  type DomainSeed,
} from './topology-layout';

interface Props {
  domains: DomainSeed[];
  hoveredSlug: string | null;
  selectedSlug: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  onClearSelect: () => void;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.001;

type Pan = { x: number; y: number };
type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startPan: Pan;
};

export function TopologyCanvas({
  domains,
  hoveredSlug,
  selectedSlug,
  onHover,
  onSelect,
  onClearSelect,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const dragRef = useRef<DragState | null>(null);

  // Track viewport size to pick the appropriate ring radii. We re-pick
  // breakpoint on resize but DON'T animate radii — the layout snaps.
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

  const handlePointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      // Only primary pointer; ignore right-click and touch-additional fingers.
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      // Ignore pointerdowns that originate inside a Domain <g> — those are
      // handled by the node and should not initiate a pan.
      const target = event.target as Element | null;
      if (target?.closest('[data-slug]')) return;

      svgRef.current?.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPan: pan,
      };
    },
    [pan],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startClientX;
      const dy = event.clientY - drag.startClientY;
      // The drag is in screen pixels; the SVG viewBox is wider than the
      // rendered element, so we just pass screen-pixel deltas straight
      // into world units. preserveAspectRatio="xMidYMid meet" keeps the
      // mapping consistent enough for hand-feel pan.
      setPan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy });
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.pointerId === event.pointerId) {
        try {
          svgRef.current?.releasePointerCapture(event.pointerId);
        } catch {
          // No capture in flight — safe to ignore.
        }
        dragRef.current = null;
      }
    },
    [],
  );

  const handleWheel = useCallback((event: WheelEvent<SVGSVGElement>) => {
    // No preventDefault: React synthesizes wheel as passive in some
    // browsers, and zoom-on-wheel is a polite default that should not
    // hijack the page scroll on the surrounding chrome. Since /explore
    // fills the viewport, vertical scroll is rare; this also keeps
    // the page accessible.
    setZoom((prev) => {
      const next = prev * (1 + event.deltaY * -ZOOM_STEP);
      return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="-500 -400 1000 800"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      role="img"
      aria-label="RAi Intelligence Topology"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{
        cursor: dragRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      {/* Click-anywhere-to-clear background. Sits OUTSIDE the transformed
          <g> so it doesn't move with pan/zoom and always covers the canvas. */}
      <rect
        x={-5000}
        y={-5000}
        width={10000}
        height={10000}
        fill="transparent"
        pointerEvents="all"
        onClick={onClearSelect}
      />
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
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
        <TopologyRA />
      </g>
    </svg>
  );
}
