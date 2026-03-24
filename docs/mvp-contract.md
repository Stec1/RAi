# RAi — MVP Contract

> This document is the hard scope contract for RAi MVP.
> Every feature decision is validated here first.
> If a feature is not described below — it is not in MVP.

---

## What RAi MVP Is

RAi MVP is a web product where every person can have one Meta Star: a unique spatial presence in a shared cosmic meta-universe. The universe is visualized as a realistic interactive map. Users can claim a Meta Star, generate its atmosphere with AI, associate it with thematic Planets, and share it with a unique URL. The product is monetized through AI credits and a Pro subscription.

---

## What Is In MVP

### Meta Stars (core product)
- One Meta Star per user account
- Permanent unique name and address: `rai.app/@name`
- Display name and bio (160 chars max)
- Star type: Cold / Warm / Binary / Dim / Giant
- AI-generated atmosphere → visual representation on the Explore map
- Planet association: 1–2 optional thematic planets
- Public / Private visibility modes
- Visitor tracking and notifications

### Explore Map
- Full-screen interactive 2D/2.5D WebGL map
- RA at center — always visible, ambient animated
- 7 Planets at fixed orbital positions
- Satellite objects near Planets (visual only — no interaction)
- Meta Stars as colored glow points on the map
- Zoom, pan, hover, click interactions
- Hover Planet → highlights associated Meta Stars
- Click Planet → info panel
- Click Meta Star → preview panel or Public Star Preview
- Mini-map in bottom-right corner
- Nav items highlight related objects on hover

### Navigation Layer (Explore)
- Transparent top nav: RAi / Planets / Satellites / Meta Stars / Burger
- Slide-in info panels per nav item
- Meta Stars panel includes "Create your meta" CTA
- Satellites panel shows "Coming soon"

### Creation Flow
- 3-step: Identity → Atmosphere → Visibility
- Star name validation, reserved words, availability check
- AI Atmosphere Generator with BullMQ + SSE
- Starter prompts (no credit cost)
- Launch → star appears in Profile and (if public) on map

### AI Atmosphere Generator
- GPT-4o structured output → AtmosphereParams JSON
- 8 parameters: primaryColor, secondaryColor, fogDensity, particleType, particleCount, ambientMood, glowIntensity, mapMarkerStyle
- 2 credits per generation
- Rollback: up to 3 previous versions
- Rate limit: 10 generations/hour

### Profile Dashboard
- Meta Star card with atmosphere visual
- Visitor metrics
- Plan and credits display
- Edit Atmosphere, Edit Info, Share, Toggle Public/Private
- "Connect Wallet" as Coming Soon label only

### Public Star Preview
- Public page at `/star/:name`
- Atmosphere render, bio, planet badges, visitor count
- OG image for social sharing
- "Enter Universe" CTA

### Auth
- Email/password + Google OAuth (Better Auth)
- Session cookies
- Email verification, password reset

### Monetization
- Credit packages: Starter 50/$5, Growth 200/$15, Pro Pack 500/$30
- Pro subscription: $12/month, 7-day trial
- Stripe Checkout + Billing + Customer Portal

### Start Page / About / Login
- Atmospheric narrative landing page
- About screen (ecosystem description)
- Login and Get Started screens

---

## What Is NOT In MVP

The following are explicitly out of scope. Any Cursor prompt containing these topics must be rejected:

- Deep spatial navigation / enterable star worlds
- Enterable Planets (Planets are nav hubs only)
- Satellites as a functional user-facing layer
- Web3 / NFT / wallet / on-chain identity (any form)
- NPC AI agents inside Meta Stars
- Constellation mechanics / social graph
- Native mobile app
- Real-time presence ("who is inside a star right now")
- Marketplace between Meta Stars
- Advanced creator economy
- Custom admin panel
- Multi-language support
- Email campaigns / automated sequences

---

## Post-MVP (Locked in Backlog)

| Phase | Feature |
|---|---|
| Phase 2 | Enterable Meta Star worlds (deep spatial experience) |
| Phase 2 | Satellites as an active functional layer |
| Phase 2 | NPC agents inside Meta Stars |
| Phase 2 | Constellation groups |
| Phase 3 | Planets as enterable spaces |
| Phase 3 | Web3 / on-chain identity layer |
| Phase 3 | Creator economy between Meta Stars |
| Future | Spatial traversal mechanics (see `docs/future-reference.md`) |

---

## Anti-Scope-Creep Rules

1. **New idea during a sprint → backlog, not the current issue.** If an idea appears during ISSUE-X, it goes to `docs/backlog.md`. Not into the current PR.

2. **If a feature is not in this document, it does not exist in MVP.** Any "maybe we should also add..." is answered with: check this document first.

3. **Cursor Agent does not implement backlog items without a separate explicit issue.**

4. **Feature freeze during an active issue.** While ISSUE-X is being executed, no scope changes elsewhere.

5. **Architecture changes only through `docs/decision-log.md`.** Cursor cannot independently change the stack or folder structure.

6. **Good enough for MVP is a valid verdict.** If a feature works and passes Acceptance Criteria, it ships.

---

## WOW Moment

> Claim → Prompt → Star appears on the map

Scenario: user registers → creates Meta Star → writes a prompt → AI generates atmosphere → their star appears on the Explore map with a unique visual identity → they copy `rai.app/@name` → they share it.

If this sequence produces a sense of "I have a place in this universe" — the MVP works.
If not — something is wrong with either the map or the atmosphere visual quality.

---

## Launch Definition

**Soft Launch (50 invited users):**
- All ISSUE-00 → ISSUE-16 merged and verified
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
