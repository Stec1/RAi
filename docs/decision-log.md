# RAi — Architectural & Product Decision Log

> Records all key technical and product decisions.
> Each entry explains the decision, what was rejected, and whether to revisit.
> Cursor Agent reads this document. Decisions are not reversed without a new entry.

---

## DL-01 — Web-First, Not Native App

**Decision:** MVP is web-only. Mobile browser via graceful degradation. No React Native or native iOS/Android before public launch.

**Why:**
- Solo founder cannot maintain 3 codebases in parallel at quality
- Web allows instant deploy without App Store review
- Next.js + Three.js delivers the required UX in browser
- App Store submission = minimum 2-week delay for any launch fix

**Trade-off:** Some mobile users get a less immersive map experience. Addressed via mobile-optimized canvas (simplified rendering, touch controls).

**Revisit:** Yes — after public launch if mobile D7 retention < 15%

---

## DL-02 — Email + Google OAuth, Not Magic Link or Passkeys

**Decision:** Better Auth with email/password and Google OAuth. No magic links, passkeys, or additional social logins in MVP.

**Why:**
- Email/password has the lowest friction for non-technical users
- Google OAuth is the most familiar and trusted flow for the target audience
- Magic links depend on email delivery reliability
- Passkeys are too new for part of the target audience

**Trade-off:** No Twitter OAuth. Compensated by strong Google OAuth.

**Revisit:** Yes — add Twitter OAuth if creator seeding shows Twitter as primary acquisition channel

---

## DL-03 — No Web3 in MVP

**Decision:** Zero blockchain dependency in MVP. No wallet connect, NFT, token, or smart contract.

**Why:**
- Wallet integration adds friction at the most critical onboarding moment
- Star NFT without a live product = speculation, not utility
- Smart contracts + audits + gas fees = separate team and budget
- Reputational risk: Web3 launch without utility = backlash

**Trade-off:** Loss of early crypto-native audience. But that audience is not the product wedge.

**Revisit:** Yes — Phase 3 (months 10–15) after traction and live product

---

## DL-04 — JSON Params, Not Full AI 3D Generation

**Decision:** AI generation = text prompt → `AtmosphereParams` JSON (8 parameters) → visual on map. Not 3D geometry generation.

**Why:**
- Full 3D gen (NeRF, mesh) — too expensive in tokens and compute for MVP
- Latency of full 3D gen = 10–60s. MVP target = 2–5s
- JSON params + Three.js = sufficient subjective uniqueness per star
- GPT-4o structured output = reliable, predictable, low cost

**Trade-off:** Less visual depth than real 3D gen. Compensated by 8 parameters and strong starter prompt variety.

**Revisit:** Yes — Phase 2/3 after quality 3D generation APIs become accessible

---

## DL-05 — Monolith API, Not Microservices

**Decision:** `apps/api` = monolithic Fastify server. BullMQ worker as separate process within the same Railway service. Microservices in Phase 3.

**Why:**
- Solo founder cannot effectively debug and deploy 5+ services
- Monolith = single CI/CD pipeline, single log stream, single Railway service
- Shared Prisma instance simplifies transactions
- Easier to debug in Cursor

**Trade-off:** Scaling bottleneck if AI generation queue blocks HTTP requests. Solved by BullMQ worker as separate process on same service.

**Revisit:** Yes — if Railway CPU/memory utilization > 70% consistently

---

## DL-06 — Issue-Based Execution via Claude + Cursor

**Decision:** All development goes through GitHub Issues → Claude prompt generation → Cursor Agent execution → diff review → merge. No free-form "write me this whole feature" prompts.

**Why:**
- Cursor Agent without context makes arbitrary architectural decisions
- Large prompts = large diffs = hard review = architectural drift risk
- Issue-based = every merge is reviewable, reversible, documented
- Claude holds architectural memory between sessions; Cursor does not

**Trade-off:** Slightly slower start than "just start coding." Every hour saved on refactoring is worth 10 hours of early chaos.

**Revisit:** No — this is the operating system, not a temporary approach

---

## DL-07 — 2D/2.5D Map, Not Full 3D Space

**Decision:** Explore map = 2D/2.5D WebGL orthographic view. Not full 3D space navigation.

**Why:**
- Full 3D space navigation = complex UX (controls, orientation, motion sickness)
- 2D map with zoom/pan = familiar mental model (Google Earth-like)
- Performance: 2D with 300+ stars is significantly cheaper than 3D
- 2D map can be built in 1 issue; full 3D takes 3–4

**Trade-off:** Less immersive on the map. Compensated by the fact that the map is a discovery tool — depth lives inside Meta Stars (Phase 2).

**Revisit:** Yes — Phase 2 if user research shows 2D map fails to communicate spatial presence

---

## DL-08 — Planets as Navigation Hubs, Not Enterable Spaces

**Decision:** In MVP, Planets are thematic filters and navigation anchors. They are not enterable spaces. Clicking a Planet opens an info panel — it does not navigate into a Planet world.

**Why:**
- Enterable Planets = massive additional scope (separate environment, rendering, content)
- The value of Planets in MVP is discovery and categorization, not immersion
- Users need to see the map, find interesting Meta Stars, and register — not explore Planet interiors

**Trade-off:** Less spatial depth. The tradeoff is explicitly accepted in exchange for faster launch.

**Revisit:** Yes — Phase 3

---

## DL-09 — Session Cookies, Not JWT

**Decision:** Better Auth with session cookies. No JWT tokens in MVP.

**Why:**
- JWT revocation is a hard problem (needs blacklist = Redis lookup)
- Session cookies: httpOnly, secure, sameSite = secure by default
- Better Auth manages sessions natively
- SSR in Next.js App Router is simpler with cookies than JWT in headers

**Trade-off:** Cookies require CSRF consideration. Solved via `sameSite: strict`. No stateless scaling benefit of JWT, but Railway single-instance at MVP scale is fine.

**Revisit:** Yes — if native mobile app requires JWT (Phase 4)

---

## DL-10 — Three.js for Map, Not Custom Canvas

**Decision:** Explore map built with Three.js (orthographic camera, 2D mode). Not a custom Canvas2D implementation.

**Why:**
- Three.js provides WebGL-backed rendering with good performance for 300+ point objects
- Existing team knowledge and ecosystem (React Three Fiber available)
- Glow, particles, and shader effects are significantly easier in Three.js than Canvas2D
- Three.js is already in scope for atmosphere rendering in Phase 2

**Trade-off:** Three.js is heavier than Canvas2D for a pure 2D map. Mitigated by lazy loading and mobile detection.

**Revisit:** No

---

## DL-11 — mapMarkerStyle as AtmosphereParams Field

**Decision:** `AtmosphereParams` includes a `mapMarkerStyle` field that controls how the star appears on the Explore map (point / ring / pulse / cross).

**Why:**
- Without this, all stars look identical on the map regardless of atmosphere
- `mapMarkerStyle` makes AI generation immediately visible to other users on the map
- Creates a social incentive to generate a better atmosphere
- Low implementation cost — just a rendering switch in the map component

**Trade-off:** Adds one more parameter to validate in the structured output schema.

**Revisit:** No

---

## DL-12 — No Enterable Star Worlds in MVP

**Decision:** Meta Stars do not have enterable 3D worlds in MVP. The Public Star Preview shows a static atmosphere render. Deep spatial navigation inside a star is Phase 2.

**Why:**
- Enterable worlds require a full 3D scene per star = enormous scope increase
- Solo founder cannot build both a quality map AND quality enterable worlds simultaneously
- The WOW moment in MVP is "my star appears on the map" — not "enter my star"
- See `docs/future-reference.md` for the Phase 2 traversal vision

**Trade-off:** Less depth per star. Completely acceptable for MVP where the goal is "claim your star."

**Revisit:** Yes — Phase 2. Reference: `docs/future-reference.md`
