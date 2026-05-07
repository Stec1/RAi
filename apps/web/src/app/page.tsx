// Start Page (`/`) — public, always rendered.
//
// Per docs/screens-spec.md (Screen 1) the root route is the public
// Start Page for every visitor. DL-26 governs only the post-auth
// destination chosen by login/signup; it does NOT require redirecting
// authenticated users away from `/`.
//
// Authenticated visitors who want their post-auth surface use the
// TopBar actions (Explore / Dashboard / Create Observatory), which
// are auth-aware (see TopBar.tsx).

import { TopBar } from '../components/landing/TopBar';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/landing/Footer';

// Per DL-27 (ISSUE-08R.3) the Start Page no longer renders a PNG-based
// domain showcase. Domain visuals are deferred to a future visual
// system; the canonical domain treatment is now SVG nodes on /explore
// (DL-26). Narrative flow: Hero → How it Works → CTA → Footer.

export default function Home() {
  return (
    <>
      <TopBar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
