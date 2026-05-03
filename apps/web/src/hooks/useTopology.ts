// Tiny external store for topology viewport state. Shared between the WebGL
// canvas (writer) and the SVG mini-map (reader).
//
// Implementation choice: useSyncExternalStore + module-scoped subscribers, not
// Zustand. Zustand is explicitly not approved for this issue. Context would
// also work, but a plain store keeps the canvas-to-mini-map data flow flat
// and avoids forcing a re-render of the canvas tree on every camera frame.

import { useSyncExternalStore } from 'react';
import type { TopologyViewport } from '../lib/topology-utils';

let viewport: TopologyViewport = {
  cameraX: 0,
  cameraY: 0,
  zoom: 1,
  viewportWorldWidth: 1200,
  viewportWorldHeight: 1200,
};

const subscribers = new Set<() => void>();

export const setTopologyViewport = (next: Partial<TopologyViewport>): void => {
  viewport = { ...viewport, ...next };
  subscribers.forEach((cb) => cb());
};

export const getTopologyViewport = (): TopologyViewport => viewport;

const subscribe = (cb: () => void): (() => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};

// Server snapshot: same singleton on the server side. The minimap is only
// rendered on the client (mounted alongside the dynamic-imported canvas), but
// useSyncExternalStore still needs a server snapshot to satisfy its contract.
const getServerSnapshot = (): TopologyViewport => viewport;

export const useTopologyViewport = (): TopologyViewport =>
  useSyncExternalStore(subscribe, getTopologyViewport, getServerSnapshot);
