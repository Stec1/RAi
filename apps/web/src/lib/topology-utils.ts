// Pure helpers for the intelligence topology.
//
// World units: RA at (0,0); Domain seed positions span roughly ±420 on X,
// ±380 on Y. Default zoom (= 1) frames a half-extent of ~600 world units on
// the longest axis so all 7 Domains fit comfortably without clipping.

export const WORLD_HALF_EXTENT = 600;

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 4.0;

export const PAN_DECAY_MS = 600;
export const ZOOM_DURATION_MS = 300;

// Default starting zoom. Smaller viewports zoom out a touch so all 7 Domains
// remain visible without forcing the user to pinch out first.
export const DEFAULT_ZOOM_DESKTOP = 1.0;
export const DEFAULT_ZOOM_MOBILE = 0.7;

export const clampZoom = (zoom: number): number =>
  Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));

// Easing curves. ease-out for pan inertia tail, ease-in-out for zoom tween.
export const easeOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// Viewport state shared between the WebGL canvas and the SVG mini-map.
export interface TopologyViewport {
  cameraX: number;
  cameraY: number;
  zoom: number;
  // Visible viewport size measured in world units (used by the mini-map to
  // draw the camera frustum rectangle).
  viewportWorldWidth: number;
  viewportWorldHeight: number;
}
