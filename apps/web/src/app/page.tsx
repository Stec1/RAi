// Start Page (`/`) — the RAI Terminal (PATCH-PIVOT-01, DL-31/DL-32).
//
// The scroll-narrative landing (Hero → How it Works → CTA) is retired;
// its narrative lives in /about copy now. `/` is a one-page terminal
// hosting the living universe, rendered for every visitor — DL-26 still
// governs only the post-auth destination chosen by login/signup, and
// authenticated users are never redirected away from `/`.
//
// `/explore` renders the same terminal; both routes stay so existing
// redirects and TopBar links keep working.

import { RaiTerminal } from '../components/terminal/RaiTerminal';

export default function Home() {
  return <RaiTerminal />;
}
