# RAi — Architectural & Product Decision Log

> Records all key technical and product decisions.
> Each entry explains the decision, what was rejected, and whether to revisit.
> Agent reads this document. Decisions are not reversed without a new entry.

---

## DL-01 — Web-First, Not Native App

**Decision:** MVP is web-only. Mobile browser via graceful degradation. No React Native or native iOS/Android before public launch.

**Why:**
- Solo founder cannot maintain 3 codebases in parallel at quality
- Web allows instant deploy without App Store review
- Next.js + Three.js delivers the required UX in browser
- App Store submission = minimum 2-week delay for any launch fix

**Trade-off:** Some mobile users get a less immersive topology experience. Addressed via mobile-optimized canvas (simplified rendering, touch controls).

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
- On-chain identity without a live product = speculation, not utility
- Smart contracts + audits + gas fees = separate team and budget
- Reputational risk: Web3 launch without utility = backlash

**Trade-off:** Loss of early crypto-native audience. But that audience is not the product wedge.

**Revisit:** Yes — Phase 4 after traction and live product

---

## DL-04 — JSON Params for Visual Signature, Not Full AI Generation

**Decision:** AI generation = text prompt → `VisualSignature` JSON (8 parameters) → visual on topology and Observatory page. Not image generation or 3D geometry.

**Why:**
- Full image/3D gen — too expensive in tokens and compute for MVP
- Latency of full generation = 10–60s. MVP target = 2–5s
- JSON params + CSS/WebGL = sufficient visual uniqueness per Observatory
- GPT-4o structured output = reliable, predictable, low cost

**Trade-off:** Less visual depth than real image/3D gen. Compensated by 8 parameters and strong prompt variety.

**Revisit:** Yes — Phase 2/3 after quality generation APIs become accessible

---

## DL-05 — Monolith API, Not Microservices

**Decision:** `apps/api` = monolithic Fastify server. BullMQ workers as separate processes within the same Railway service. Microservices in Phase 3.

**Why:**
- Solo founder cannot effectively debug and deploy 5+ services
- Monolith = single CI/CD pipeline, single log stream, single Railway service
- Shared Prisma instance simplifies transactions
- Easier to debug

**Trade-off:** Scaling bottleneck if AI generation queue blocks HTTP requests. Solved by BullMQ workers as separate processes on same service.

**Revisit:** Yes — if Railway CPU/memory utilization > 70% consistently

---

## DL-06 — Issue-Based Execution via Claude + Agent

**Decision:** All development goes through GitHub Issues → Claude prompt generation → Agent execution → diff review → merge. No free-form "write me this whole feature" prompts.

**Why:**
- Agent without context makes arbitrary architectural decisions
- Large prompts = large diffs = hard review = architectural drift risk
- Issue-based = every merge is reviewable, reversible, documented
- Claude holds architectural memory between sessions

**Trade-off:** Slightly slower start than "just start coding." Every hour saved on refactoring is worth 10 hours of early chaos.

**Revisit:** No — this is the operating system, not a temporary approach

---

## DL-07 — 2D/2.5D Topology, Not Full 3D Space

**Decision:** Intelligence topology = 2D/2.5D WebGL orthographic view. Not full 3D space navigation.

**Why:**
- Full 3D space navigation = complex UX (controls, orientation, motion sickness)
- 2D topology with zoom/pan = familiar mental model (data visualization)
- Performance: 2D with 300+ nodes is significantly cheaper than 3D
- 2D topology can be built in 1 issue; full 3D takes 3–4

**Trade-off:** Less immersive on the topology. Compensated by the fact that the topology is a discovery tool — depth lives in Observatory pages and publications.

**Revisit:** Yes — Phase 2 if user research shows 2D topology fails to communicate the intelligence network

---

## DL-08 — Domains as Thematic Hubs, Not Enterable Spaces

**Decision:** In MVP, Domains are thematic filters and navigation anchors. They are not enterable spaces. Clicking a Domain opens an info panel — it does not navigate into a Domain world.

**Why:**
- Enterable Domains = massive additional scope (separate environment, rendering, content)
- The value of Domains in MVP is discovery and categorization, not immersion
- Users need to find Observatories, read publications, and register — not explore Domain interiors

**Trade-off:** Less spatial depth. The tradeoff is explicitly accepted in exchange for faster launch.

**Revisit:** Not planned

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

## DL-10 — Three.js for Topology, Not Custom Canvas

**Decision:** Intelligence topology built with Three.js (orthographic camera, 2D mode). Not a custom Canvas2D implementation.

**Why:**
- Three.js provides WebGL-backed rendering with good performance for 300+ node objects
- Existing ecosystem (React Three Fiber available)
- Glow, ambient effects, and shader effects are significantly easier in Three.js than Canvas2D
- Three.js is already in scope for Visual Signature rendering

**Trade-off:** Three.js is heavier than Canvas2D for a pure 2D visualization. Mitigated by lazy loading and mobile detection.

**Revisit:** No

---

## DL-11 — nodeStyle as VisualSignature Field

**Decision:** `VisualSignature` includes a `nodeStyle` field that controls how the Observatory appears on the intelligence topology (point / ring / pulse / cross).

**Why:**
- Without this, all Observatories look identical on the topology regardless of Visual Signature
- `nodeStyle` makes AI generation immediately visible to other users on the topology
- Creates a social incentive to generate a better Visual Signature
- Low implementation cost — just a rendering switch in the topology component

**Trade-off:** Adds one more parameter to validate in the structured output schema.

**Revisit:** No

---

## DL-12 — Observatory Pages, Not Enterable Worlds

**Decision:** Observatories have public pages at `/observatory/:name`, not enterable 3D worlds. The page shows a premium editorial layout with Visual Signature, systems, and publications.

**Why:**
- Enterable worlds require a full 3D scene per Observatory = enormous scope increase
- Solo founder cannot build both a quality topology AND quality enterable worlds simultaneously
- The WOW moment in MVP is "publish → prove → get discovered" — not "enter my world"
- See `docs/future-reference.md` for post-MVP expansion

**Trade-off:** Less depth per Observatory. Completely acceptable for MVP where the goal is proof of work and reputation.

**Revisit:** Not planned

---

## DL-13 — Product Pivot: Metaverse → Observatory Platform

**Decision:** RAi pivoted from "premium spatial identity metaverse" to "premium observatory platform for AI systems." The core mechanic changed from "claim a star, generate atmosphere, appear on map" to "create Observatory, publish research, build reputation, get discovered."

**Why:**
- The original metaverse concept lacked clear utility beyond visual novelty
- AI economy needs a professional identity layer — not decorative worlds
- Publication-based proof of work is a stronger retention mechanic than atmosphere generation
- Reputation through community evaluation (upvotes) creates genuine network effects
- Client-facing discovery through real results is more valuable than cosmic addresses

**Trade-off:** Loss of the cosmic/spatial emotional hook. Compensated by the professional value proposition: "Don't describe your AI. Prove it."

**Revisit:** No — this is a foundational direction change

---

## DL-14 — Terminology Migration

**Decision:** All product terminology updated to reflect the observatory platform direction. Full mapping:

| Old term | New term |
|---|---|
| Meta Star / Star | Observatory |
| Planet | Domain |
| Satellite | Removed entirely |
| atmosphere / atmosphereParams | Visual Signature / visualSignature |
| StarVisit | ObservatoryVisit |
| starId | observatoryId |
| planetIds | domainIds |
| Profile | Control Panel / Dashboard |
| Constellation | Removed entirely |

**Why:**
- Old terminology communicated "cosmic game" — contradicts the professional platform direction
- "Observatory" carries the right connotation: observation, research, publishing
- "Domain" better describes thematic categorization than "Planet"
- "Visual Signature" is a design identity concept, not a cosmic atmosphere

**Revisit:** No

---

## DL-15 — Publications as Core Content Unit

**Decision:** Publications are the core content unit of RAi. Creator submits raw AI output → RAi AI (GPT-4o) formats it into a structured presentation. This replaces the old "AI Atmosphere Generator" as the primary AI feature.

**Why:**
- Proof of work through structured publications is the core value proposition
- AI-assisted formatting lowers the barrier: paste output, get a polished presentation
- Each publication is evidence of capability — builds reputation over time
- Publications are more shareable, discoverable, and evaluable than atmosphere parameters

**Trade-off:** Publication formatting quality is now a critical risk. If GPT-4o produces poor formatted output, the core value loop breaks.

**Revisit:** No — this is the core product mechanic

---

## DL-16 — Systems as Registered Entities

**Decision:** AI agents, workflows, tools, and services are registered as "Systems" within an Observatory. Systems are the "who did the work" behind publications.

**Why:**
- Separating the creator from their tools enables proper attribution
- A single Observatory can have multiple AI systems (multi-agent creators)
- System cards provide structured proof of capability (type, status, capabilities)
- System-publication linking creates a track record per system

**Trade-off:** Adds complexity to the creation and management flow. Mitigated by making System registration optional during onboarding.

**Revisit:** No

---

## DL-17 — Upvotes, Not Reviews

**Decision:** Community evaluation via upvotes on publications. No star ratings, text reviews, or downvotes.

**Why:**
- Upvotes are low-friction — one click to signal quality
- No downvotes prevents toxic dynamics in a small community
- Text reviews require moderation infrastructure not in MVP scope
- Upvote counts are a simple, clear signal for ranking and reputation

**Trade-off:** Less nuanced feedback than reviews. Acceptable for MVP — comments and richer evaluation planned for Phase 2.

**Revisit:** Yes — add comments in Phase 2. Downvotes never planned.

---

## DL-18 — Explore is Public, Auth for Upvoting

**Decision:** The Explore screen (`/explore`) is publicly accessible without authentication. Browsing publications, Observatories, and the intelligence topology does not require login. Upvoting requires authentication.

**Why:**
- Public browsing maximizes discovery and organic traffic (SEO, shared links)
- Forcing login before browsing creates unnecessary friction for visitors
- Upvotes require auth to prevent abuse and ensure one-per-user enforcement
- Observatory public pages are already public — Explore should be consistent

**Trade-off:** Anonymous browsing provides less analytics data. Mitigated by PostHog session tracking for anonymous users.

**Revisit:** No

---

## DL-19 — Pro Subscription at $19/month

**Decision:** Pro subscription priced at $19/month. Free tier includes 5 publications/month, 3 systems, basic analytics, and 10 starting credits.

**Why:**
- $19/month positions RAi as a professional tool, not a consumer toy
- Free tier is generous enough for early validation (5 publications covers first month)
- Pro removes limits and adds advanced features (unlimited publications, unlimited systems, detailed analytics)
- Price point is competitive with professional SaaS tools for creators

**Trade-off:** Higher price point may reduce conversion rate. Compensated by generous free tier and the professional positioning.

**Revisit:** Yes — after soft launch based on conversion data

---

## DL-20 — 3 Active Domains at Launch

**Decision:** 3 of 7 Domains are active at launch (Nexum, Keth, Solum). The remaining 4 (Vorda, Lyren, Auren, Draxis) are seeded in the DB but marked as Coming Soon in the UI.

**Why:**
- 3 Domains provide enough thematic variety for the target audience (AI/tech creators, business builders, researchers)
- 7 active Domains with few creators per Domain = empty, meaningless categories
- Coming Soon creates anticipation and a growth lever (activate Domains as creator density justifies)
- All 7 are seeded to avoid future migration — only the `active` flag changes

**Trade-off:** Creators in art, music, philosophy, and experimental spaces cannot yet associate with their ideal Domain. Mitigated by allowing unaffiliated Observatories.

**Revisit:** Yes — activate Domains individually as creator density exceeds 20 Observatories per active Domain

---

## DL-21 — First Publication During Onboarding

**Decision:** The Observatory creation flow includes a "First Publication" step where the creator pastes raw AI output and publishes their first formatted piece during onboarding.

**Why:**
- An Observatory with zero publications has no proof of work — defeats the purpose
- Immediate first publication creates a complete profile from day one
- Reduces time-to-value: creator sees the full publish → format → appear loop immediately
- Converts the onboarding from "fill in a form" to "show what you can do"

**Trade-off:** Longer onboarding flow (3 steps instead of 2). Mitigated by making Step 2 and Step 3 clear and fast.

**Revisit:** No

---

## DL-22 — Reputation Score, Not Star Ratings

**Decision:** Observatory reputation is a numeric score accumulated from activity and community evaluation — not a star rating or review average.

**Reputation formula:**
- Complete Observatory profile: +10
- Register System: +5
- Publish research: +5
- Publication gets 10+ upvotes: +10
- Publication gets 50+ upvotes: +25
- Consistent publishing (4+ per month): +15 streak bonus

**Why:**
- Accumulated score rewards consistent quality over time
- Star ratings encourage gaming and create perception problems (4.7 vs 4.8 anxiety)
- Reputation from activity + evaluation is more nuanced than a single number average
- Score-based ranking in Explore creates clear incentive to publish and improve

**Trade-off:** Reputation score is opaque — users may not understand how to improve it. Mitigated by showing score breakdown in Control Panel.

**Revisit:** Yes — formula may need tuning after soft launch based on actual distribution

---

## DL-23 — Issue Pack Expansion: 17 → 21 Issues

**Decision:** The issue pack expanded from 17 issues (ISSUE-00 through ISSUE-16 in v2) to 21 issues (ISSUE-00 through ISSUE-20 in v3) to cover the new product surface.

**New issues added:**
- ISSUE-13: Systems Registration (new product object)
- ISSUE-14: Publication System (core content engine, replaces old AI Atmosphere Generator focus)
- ISSUE-16: Explore Feed + Discovery (new discovery surface beyond map)
- ISSUE-17: Upvote + Reputation (new community evaluation layer)

**Why:**
- The observatory platform has a larger functional surface than the metaverse concept
- Systems and Publications are first-class product objects that need dedicated issues
- Discovery (feed + search) is a separate concern from the intelligence topology
- Upvote + Reputation is a standalone system with its own schema, API, and UI

**Trade-off:** More issues = longer path to soft launch. Mitigated by the fact that each issue is smaller and more focused.

**Revisit:** No

---

## DL-24 — Session Cookie sameSite = Lax (Cross-Origin Setup)

**Decision:** Session cookies use `sameSite: "lax"`, not `sameSite: "strict"`. This overrides the original stance in DL-09.

**Why:**
- The API (Railway, e.g. `api.rai.app`) and the web app (Vercel, e.g. `rai.app`) are on different origins
- `sameSite: "strict"` blocks cookies on cross-site XHR — the browser would not send the session cookie to the API from the web app
- `sameSite: "lax"` allows the cookie on top-level navigations and eligible cross-site requests, which is required for this cross-origin auth flow to work
- CSRF risk is mitigated by:
  - `httpOnly: true` (no JS access to the cookie)
  - `secure: true` in production (HTTPS only)
  - Better Auth's built-in CSRF protection on state-changing routes
  - Explicit CORS `origin` allow-list (only `WEB_URL`)

**Trade-off:** Slightly weaker CSRF posture than `strict`. Acceptable given the mitigations above and the fact that a single-origin deployment is not realistic for Railway + Vercel.

**Revisit:** Yes — if the API and web are ever consolidated onto the same origin (e.g. both behind a single reverse proxy), reconsider `strict`.
