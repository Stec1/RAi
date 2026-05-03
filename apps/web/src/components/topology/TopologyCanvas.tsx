'use client';

// Main R3F canvas for the intelligence topology.
//
// Camera: orthographic, zoom-based scaling (not frustum-resize), so world
// coordinates are stable as the viewport zooms in/out.
//
// Pan: pointer-down + drag → camera translates in world units. On
// pointer-up, momentum is applied as an exponential ease-out tail (~600ms).
// Inertia is gated by prefers-reduced-motion.
//
// Zoom: wheel deltas trigger a 300ms ease-in-out tween toward the new zoom.
// Two-finger pinch on touch drives zoom directly (no tween — tracking the
// gesture). Wheel/pinch zoom both clamp to [ZOOM_MIN, ZOOM_MAX].
//
// State: camera position + zoom + viewport-in-world-units published every
// frame to a tiny external store consumed by the SVG mini-map.

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Domain } from '@rai/shared';

import { TopologyRA } from './TopologyRA';
import { TopologyDomains } from './TopologyDomains';
import { setTopologyViewport } from '../../hooks/useTopology';
import {
  WORLD_HALF_EXTENT,
  DEFAULT_ZOOM_DESKTOP,
  DEFAULT_ZOOM_MOBILE,
  PAN_DECAY_MS,
  ZOOM_DURATION_MS,
  clampZoom,
  easeInOutQuad,
  easeOutExpo,
} from '../../lib/topology-utils';

interface PanState {
  isPanning: boolean;
  lastClientX: number;
  lastClientY: number;
  // Velocity in world units per frame. Sampled on the last move event so the
  // release tail has something to decay from.
  velocityWorldX: number;
  velocityWorldY: number;
}

interface PanInertia {
  velocityWorldX: number;
  velocityWorldY: number;
  startTime: number;
}

interface ZoomTween {
  startZoom: number;
  targetZoom: number;
  startTime: number;
}

interface PinchState {
  initialDistance: number;
  initialZoom: number;
}

function CameraController({
  reducedMotion,
  isSmallViewport,
}: {
  reducedMotion: boolean;
  isSmallViewport: boolean;
}) {
  const { camera, gl, size } = useThree();
  const cameraRef = useRef(camera as THREE.OrthographicCamera);

  const panState = useRef<PanState>({
    isPanning: false,
    lastClientX: 0,
    lastClientY: 0,
    velocityWorldX: 0,
    velocityWorldY: 0,
  });
  const inertia = useRef<PanInertia | null>(null);
  const zoomTween = useRef<ZoomTween | null>(null);
  const pinch = useRef<PinchState | null>(null);
  const initialZoomApplied = useRef(false);

  // Configure orthographic frustum to match the canvas size 1:1 in world units
  // at zoom = 1. Resizing keeps world coordinates stable; zoom scales them.
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cameraRef.current = cam;
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    cam.left = -halfWidth;
    cam.right = halfWidth;
    cam.top = halfHeight;
    cam.bottom = -halfHeight;
    cam.near = -1000;
    cam.far = 1000;
    if (!initialZoomApplied.current) {
      const baseZoom = isSmallViewport ? DEFAULT_ZOOM_MOBILE : DEFAULT_ZOOM_DESKTOP;
      // Scale base zoom by min(width, height) / (2 * WORLD_HALF_EXTENT) so all
      // 7 Domains fit comfortably regardless of canvas size.
      const fit = Math.min(size.width, size.height) / (2 * WORLD_HALF_EXTENT);
      cam.zoom = baseZoom * fit;
      cam.position.set(0, 0, 10);
      initialZoomApplied.current = true;
    }
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height, isSmallViewport]);

  useFrame(() => {
    const cam = cameraRef.current;
    if (!cam) return;

    // Active zoom tween (wheel-driven).
    if (zoomTween.current) {
      const { startZoom, targetZoom, startTime } = zoomTween.current;
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / ZOOM_DURATION_MS);
      const eased = easeInOutQuad(t);
      cam.zoom = startZoom + (targetZoom - startZoom) * eased;
      cam.updateProjectionMatrix();
      if (t >= 1) zoomTween.current = null;
    }

    // Active pan inertia tail.
    if (inertia.current) {
      const elapsed = performance.now() - inertia.current.startTime;
      const t = Math.min(1, elapsed / PAN_DECAY_MS);
      // (1 - easeOutExpo) creates the "slow stop" curve.
      const decay = 1 - easeOutExpo(t);
      cam.position.x -= inertia.current.velocityWorldX * decay;
      cam.position.y += inertia.current.velocityWorldY * decay;
      if (t >= 1) inertia.current = null;
    }

    // Publish viewport-in-world-units for the mini-map.
    const worldWidth = (cam.right - cam.left) / cam.zoom;
    const worldHeight = (cam.top - cam.bottom) / cam.zoom;
    setTopologyViewport({
      cameraX: cam.position.x,
      cameraY: cam.position.y,
      zoom: cam.zoom,
      viewportWorldWidth: worldWidth,
      viewportWorldHeight: worldHeight,
    });
  });

  // Pointer + wheel + touch wiring. Listeners attach to gl.domElement only —
  // touch-action: none on the canvas keeps the page from scrolling under the
  // gesture without disabling page scroll elsewhere.
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      // Only primary button / single-finger pan.
      if (event.button !== 0) return;
      // Two-finger gestures are owned by the touch handlers below.
      if (event.pointerType === 'touch' && pinch.current) return;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // setPointerCapture can throw on rare devices — gesture still works.
      }
      panState.current.isPanning = true;
      panState.current.lastClientX = event.clientX;
      panState.current.lastClientY = event.clientY;
      panState.current.velocityWorldX = 0;
      panState.current.velocityWorldY = 0;
      inertia.current = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!panState.current.isPanning) return;
      const cam = cameraRef.current;
      const dx = event.clientX - panState.current.lastClientX;
      const dy = event.clientY - panState.current.lastClientY;
      const worldPerPxX = (cam.right - cam.left) / (cam.zoom * canvas.clientWidth);
      const worldPerPxY = (cam.top - cam.bottom) / (cam.zoom * canvas.clientHeight);
      const dxWorld = dx * worldPerPxX;
      const dyWorld = dy * worldPerPxY;
      cam.position.x -= dxWorld;
      cam.position.y += dyWorld;
      // Sample latest delta as the launch velocity for inertia.
      panState.current.velocityWorldX = dxWorld;
      panState.current.velocityWorldY = dyWorld;
      panState.current.lastClientX = event.clientX;
      panState.current.lastClientY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!panState.current.isPanning) return;
      panState.current.isPanning = false;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Already released — ignore.
      }
      if (!reducedMotion) {
        inertia.current = {
          velocityWorldX: panState.current.velocityWorldX,
          velocityWorldY: panState.current.velocityWorldY,
          startTime: performance.now(),
        };
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const cam = cameraRef.current;
      // Negative deltaY = wheel up = zoom in.
      const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
      const fromZoom = zoomTween.current ? zoomTween.current.targetZoom : cam.zoom;
      const target = clampZoom(fromZoom * factor);
      zoomTween.current = {
        startZoom: cam.zoom,
        targetZoom: target,
        startTime: performance.now(),
      };
    };

    const distance = (a: Touch, b: Touch): number => {
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        const [a, b] = [event.touches[0], event.touches[1]];
        pinch.current = {
          initialDistance: distance(a, b),
          initialZoom: cameraRef.current.zoom,
        };
        // Pinch overrides any active pan.
        panState.current.isPanning = false;
        inertia.current = null;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && pinch.current) {
        event.preventDefault();
        const [a, b] = [event.touches[0], event.touches[1]];
        const dist = distance(a, b);
        const ratio = dist / pinch.current.initialDistance;
        const cam = cameraRef.current;
        cam.zoom = clampZoom(pinch.current.initialZoom * ratio);
        cam.updateProjectionMatrix();
        // Pinch is direct manipulation — cancel any wheel tween.
        zoomTween.current = null;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        pinch.current = null;
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [gl, reducedMotion]);

  return null;
}

export function TopologyCanvas({ domains }: { domains: Domain[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const widthQuery = window.matchMedia('(max-width: 768px)');
    setReducedMotion(motionQuery.matches);
    setIsSmallViewport(widthQuery.matches);
    const onMotion = () => setReducedMotion(motionQuery.matches);
    const onWidth = () => setIsSmallViewport(widthQuery.matches);
    motionQuery.addEventListener('change', onMotion);
    widthQuery.addEventListener('change', onWidth);
    return () => {
      motionQuery.removeEventListener('change', onMotion);
      widthQuery.removeEventListener('change', onWidth);
    };
  }, []);

  // RA pulse: D3 — gated on !reducedMotion && !isSmallViewport.
  const pulseEnabled = !reducedMotion && !isSmallViewport;

  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ touchAction: 'none', width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10] }}
    >
      <CameraController
        reducedMotion={reducedMotion}
        isSmallViewport={isSmallViewport}
      />
      <TopologyRA pulseEnabled={pulseEnabled} />
      <TopologyDomains domains={domains} />
    </Canvas>
  );
}
