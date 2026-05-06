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
import { DomainShowcaseSection } from '../components/landing/DomainShowcaseSection';
import { CtaSection } from '../components/landing/CtaSection';
import { Footer } from '../components/landing/Footer';

export default function Home() {
  return (
    <>
      <TopBar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <DomainShowcaseSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
