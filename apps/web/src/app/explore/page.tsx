// /explore — the RAI Terminal (PATCH-PIVOT-01, DL-31).
// Renders the same one-page terminal as `/`. The route is preserved for
// existing redirects (DL-26: post-auth users without an Observatory land
// here) and TopBar links; it remains publicly browsable.

import type { Metadata } from 'next';
import { RaiTerminal } from '../../components/terminal/RaiTerminal';

export const metadata: Metadata = {
  title: 'Explore — RAi',
  description:
    'The RAI universe — RA at the center and the worlds people compose around it, real and imagined.',
};

export default function ExplorePage() {
  return <RaiTerminal />;
}
