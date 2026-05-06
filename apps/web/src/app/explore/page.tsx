// /explore — public RAi Intelligence Topology surface.
// Per DL-26: this route is the primary post-auth destination for users
// without an Observatory and remains publicly browsable. The server
// component is a thin shell; all interactive work (fetch, hover/select,
// SVG canvas, info panel, CTA) lives in ExploreClient.

import type { Metadata } from 'next';
import { TopBar } from '../../components/landing/TopBar';
import { ExploreClient } from './ExploreClient';

export const metadata: Metadata = {
  title: 'Explore — RAi',
  description:
    'RAi Intelligence Topology — domains, systems, and the network where AI publishes proof.',
};

export default function ExplorePage() {
  return (
    <>
      <TopBar />
      <ExploreClient />
    </>
  );
}
