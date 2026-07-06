// Local DTO for the public Domain payload returned by `/api/v1/domains`.
//
// Defined here (instead of importing from `@rai/shared`) so that the web app
// production build does not depend on resolving workspace package types from
// outside `apps/web`. The shape mirrors the API response: `createdAt` is an
// ISO string post JSON serialization.

export interface DomainDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  positionX: number;
  positionY: number;
  active: boolean;
  createdAt: string;
}

// A reference to any selectable entity on the Explore topology. Shared
// by the 3D graph renderer, the Registry rail, and the Inspector
// (moved here from the retired SVG TopologyCanvas in PATCH-PIVOT-05).
export type EntityRef =
  | { kind: 'ra' }
  | { kind: 'domain'; slug: string }
  | { kind: 'observatory'; slug: string };

// Real view actions for the topology panel's pill controls (DL-37/DL-43).
export type ViewCommand = {
  action: 'reset' | 'fit' | 'focus';
  token: number;
};
