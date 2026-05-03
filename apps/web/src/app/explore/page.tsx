import type { Metadata } from 'next';
import { ExploreClient } from './ExploreClient';

// Public Explore route. Server component is intentionally thin — all
// interactive work (fetching Domains, mounting the WebGL canvas, the SVG
// mini-map) lives in ExploreClient. No auth guard.

export const metadata: Metadata = {
  title: 'Explore — RAi',
  description:
    'The RAi intelligence topology — RA at the center, surrounded by the seven Domains.',
};

export default function ExplorePage() {
  return <ExploreClient />;
}
