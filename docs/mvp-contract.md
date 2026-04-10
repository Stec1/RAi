# RAi — MVP Contract

> This document is the hard scope contract for RAi MVP.
> Every feature decision is validated here first.
> If a feature is not described below — it is not in MVP.

---

## What RAi MVP Is

RAi MVP is a web platform where AI creators publish research, register systems, build reputation through quality of output, and get discovered by clients. Each creator gets one Observatory: a permanent public research space with an address, visual identity, and track record. Content is structured around publications — formatted proof of work produced by AI systems. The community evaluates publications through upvotes. Reputation is earned, not claimed.

---

## What Is In MVP

### Observatories (core product)
- One Observatory per user account
- Permanent unique name and address: `rai.app/@name`
- Display name, bio (160 chars max), social links
- Observatory type: individual / studio / product
- AI-generated Visual Signature → visual representation on the intelligence topology and Observatory page
- Domain association: 1–2 optional thematic Domains
- Public / Private visibility modes
- Visitor tracking and analytics
- Reputation score accumulated from publications and upvotes

### Systems
- AI agents, workflows, tools, and services registered by Observatory owner
- System metadata: name, type (agent/workflow/tool/service), description, capabilities, status, external URL
- Displayed as structured proof cards on the Observatory public page
- Text-only in MVP — no media attachments

### Publications
- Core content unit of RAi — formatted proof of work
- Creator submits raw output → RAi AI (GPT-4o) formats it into a structured presentation
- Publication fields: title, summary, key findings, methodology, formatted body
- Associated with a System (optional), Domain, and tags
- Upvotable by authenticated users
- Standalone page at `/publication/:id`
- OG image for social sharing
- Draft and published states
- 1 credit per publication

### Explore (Discovery)
- Three views: Feed (publications stream), Observatories (ranked list), Map (intelligence topology)
- Feed view: vertical stream of publications, filterable by Domain, sortable by trending/newest/top
- Observatories view: ranked list by reputation, filterable by Domain
- Map view: abstract network visualization with RA, Domains, and Observatories
- Full-text search across Observatory names, bios, systems, publication titles
- Public browsing without auth; upvoting requires auth
- Domain filter pills (active Domains only)

### Intelligence Topology (Map)
- Abstract data-driven network visualization
- RA at center — platform identity node
- 7 Domains at fixed positions (3 active, 4 Coming Soon)
- Observatories as nodes with Domain color association
- Node size based on reputation score
- Pan, zoom, hover, click interactions
- Mini-map in bottom-right corner
- Slide-in info panels for Domains and Observatories

### Navigation Layer (Explore)
- Transparent top nav: RAi / Domains / Observatories / Burger
- Slide-in info panels per nav item
- Observatories panel includes "Create Observatory" CTA
- Burger menu → Dashboard, Settings, Log out

### Observatory Creation Flow
- 3-step: Identity → First Publication → Visual Signature (optional)
- Observatory name validation, reserved words, availability check
- First publication created and formatted during onboarding
- Visual Signature generation optional — default assigned based on Domain
- Launch → Observatory appears in Dashboard and (if public) on map

### AI Visual Signature Generator
- GPT-4o structured output → Visual Signature JSON
- Parameters define: colors, gradients, ambient effects for Observatory page hero and map node
- 2 credits per generation
- Rollback: up to 3 previous versions (1 credit per rollback)
- Rate limit: 10 generations/hour
- BullMQ queue + SSE progress

### Control Panel (Dashboard)
- Observatory card with Visual Signature visual, reputation score
- Visitor metrics and publication analytics
- Plan and credits display
- Quick actions: Edit Identity, Manage Systems, New Publication, Visual Signature, Settings
- Sub-routes: `/dashboard/systems`, `/dashboard/publications`, `/dashboard/publish`, `/dashboard/visual`, `/dashboard/settings`

### Observatory Public Page
- Public page at `/observatory/:name`
- Hero zone: Visual Signature ambient field, name, reputation metrics, social links
- Systems section: structured proof cards
- Publications section: card stack with upvote counts
- OG image for social sharing
- Visitor tracking

### Upvote + Reputation
- One upvote per user per publication
- Reputation score: weighted accumulation from profile completeness, systems, publications, upvotes, consistency
- Reputation displayed on Observatory page and Explore rankings
- Reputation influences sort order in Observatories discovery view

### Auth
- Email/password + Google OAuth (Better Auth)
- Session cookies
- Email verification, password reset
- Rate limiting on auth endpoints (Redis-based)

### Monetization
- Credit packages: Starter 50/$5, Growth 200/$15, Pro Pack 500/$30
- Pro subscription: $19/month
- Free tier limits: 5 publications/month, 3 systems, basic analytics, 10 starting credits
- Stripe Checkout + Billing + Customer Portal

### Start Page / About / Login
- Premium dark editorial landing page
- About screen (platform explanation: Domains, Observatories, publications, reputation)
- Login and Get Started screens

---

## What Is NOT In MVP

The following are explicitly out of scope. Any prompt containing these topics must be rejected:

- Enterable worlds or spatial navigation
- Decorative cosmic universe (stars, planets as visual objects)
- Agent execution engine (RAi shows, does not execute)
- Media attachments in publications (images, video, 3D)
- Comments on publications
- Citation system between publications
- AI-assisted client-creator matching
- Research commissions or bounties
- Collaboration tools or multi-user Observatories
- Verification badges
- Benchmarks or standardized testing
- Web3 / NFT / wallet / on-chain identity (any form)
- Native mobile app
- Real-time presence ("who is online")
- Marketplace between Observatories
- Custom admin panel
- Multi-language support
- Email campaigns / automated sequences

---

## Post-MVP (Locked in Backlog)

| Phase | Feature |
|---|---|
| Phase 2 | Media attachments in publications |
| Phase 2 | Citation system (publications referencing publications) |
| Phase 2 | Comments on publications |
| Phase 2 | Verification badges for Observatories |
| Phase 2 | Advanced analytics |
| Phase 3 | Research commissions (client requests) |
| Phase 3 | Collaboration tools |
| Phase 3 | AI-assisted matching |
| Phase 3 | Benchmarks and standardized testing |
| Phase 3 | Real-time presence |
| Phase 4 | Studio tier (team features) |
| Phase 4 | Enterprise (self-hosted) |
| Phase 4 | Native mobile app |
| Future | Web3 / on-chain identity layer |

---

## Anti-Scope-Creep Rules

1. **New idea during a sprint → backlog, not the current issue.** If an idea appears during ISSUE-X, it goes to `docs/backlog.md`. Not into the current PR.

2. **If a feature is not in this document, it does not exist in MVP.** Any "maybe we should also add..." is answered with: check this document first.

3. **Agent does not implement backlog items without a separate explicit issue.**

4. **Feature freeze during an active issue.** While ISSUE-X is being executed, no scope changes elsewhere.

5. **Architecture changes only through `docs/decision-log.md`.** Agent cannot independently change the stack or folder structure.

6. **Good enough for MVP is a valid verdict.** If a feature works and passes Acceptance Criteria, it ships.

---

## WOW Moment

> Publish → Prove → Get Discovered

Scenario: creator registers → creates Observatory → registers their AI system → pastes raw output → RAi AI formats it into a polished publication → publication appears in Explore feed → community upvotes → reputation grows → client discovers through proof of work → creator copies `rai.app/@name` and shares it.

If this sequence produces a sense of "my work speaks for itself here" — the MVP works.
If not — something is wrong with either the publication formatting or the discovery experience.

---

## Launch Definition

**Soft Launch (50 invited users):**
- All ISSUE-00 → ISSUE-20 merged and verified
- E2E flow tested 5 times on a clean account
- Mobile: iPhone Safari + Android Chrome — no errors
- Load test: 50 concurrent users, p95 < 800ms
- Privacy Policy + Terms of Service published

**Public Launch:**
- Soft launch NPS > 30
- D7 retention > 20%
- Load test: 500 concurrent users
- Stripe live mode active
- All critical bugs resolved
