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

## DL-24 — Session Cookie sameSite per environment (Cross-Origin Setup)

**Decision:** Session cookies use `sameSite: "none"` + `secure: true` in production and `sameSite: "lax"` + `secure: false` in local dev. Overrides the original stance in DL-09.

**Why:**
- The API (Railway, e.g. `raiapi-production.up.railway.app`) and the web app (Vercel, e.g. `rai-web-one.vercel.app`) sit on different registrable domains, so every browser fetch from web → API is genuinely cross-site.
- `sameSite: "lax"` only attaches cookies on top-level navigations, NOT on `fetch()` from JS. That caused `POST /api/auth/sign-in/email → 200` to be followed by `GET /api/me → 401` in production: the browser dropped the session cookie on the cross-site fetch.
- `sameSite: "none"` lets the cookie ride cross-site fetches, which is mandatory for this Vercel + Railway split. Browsers require `secure: true` whenever `sameSite: "none"`, so HTTPS-only is enforced automatically.
- Local dev keeps `sameSite: "lax"` because `localhost:3000` ↔ `localhost:3001` are same-site, and `secure: true` would drop the cookie over plain http://localhost.
- CSRF risk is mitigated by:
  - `httpOnly: true` (no JS access to the cookie)
  - `secure: true` in production (HTTPS only)
  - Better Auth's built-in CSRF protection on state-changing routes
  - Explicit CORS `origin` allow-list (only `WEB_URL`) with `credentials: true`
  - `trustedOrigins: [WEB_URL]` in Better Auth config

**Trade-off:** `sameSite: "none"` gives a weaker CSRF posture than `lax`/`strict`, but is the only setting that makes the Vercel + Railway split work without a custom proxy or shared parent domain. Mitigations above are sufficient at MVP scale.

**Revisit:** Yes — once the API and web sit under a single registrable domain (e.g. `rai.app` + `api.rai.app`) we can move to `sameSite: "lax"` with a `domain=.rai.app` cookie scope. Reconsider then.

---

## DL-25 — Architectural Law: Show, Coordinate, Verify, Settle — Not Execute

**Decision:** RAi as a platform shows, coordinates, verifies, and settles. RAi never executes agents. This boundary applies to MVP and to all post-MVP architecture including the System Intelligence target.

**Engineering definition (binding):**
- Compute: RAi never allocates GPU/CPU for agent execution.
- State: RAi never stores an agent's internal state.
- Secrets: RAi never receives API keys, model weights, or system prompts of an agent.
- Network: RAi never proxies an agent's outbound calls to model APIs or third-party services.
- Trust boundary: the Provider is a separate legal subject; RAi is not responsible for agent behavior.

**Why:**
- Removes legal and infrastructure risk that compute-hosting competitors carry.
- Enables compatibility with external agent stacks because Providers keep their own runtime.
- Aligns with the existing MVP principle stated in `docs/vision.md` and `docs/mvp-contract.md`.
- Provides a stable contract that prevents post-MVP scope drift.

**Trade-off:** RAi cannot capture compute revenue from agent execution. This is intentional. Revenue comes from coordination, verification, settlement, reputation, and discovery — not compute markup.

**Operational test:** if RAi goes down for two hours, agents continue executing already-accepted commissions; they simply cannot deliver back until service resumes. If this remains true in any future architecture, the principle is intact.

**Revisit:** No. This is a foundational principle. Any change requires a successor decision that explicitly supersedes DL-25.

**See also:** `docs/si-target.md` section 2.

---


---

## DL-26 — Explore as the Primary Post-Auth Topology Surface

**Decision:** `/explore` is the primary post-auth destination for authenticated users without an Observatory. `/create` remains the CTA destination from `/explore`, not the first post-auth surface. `/dashboard` remains the destination for authenticated users with an Observatory.

**Also decided:**
- `/explore` is the RAi Intelligence Topology surface
- Domain PNG objects are not graph nodes for topology
- PNG domain objects were initially retained for landing/showcase/brand visuals; this retention is **superseded by DL-27**, which removes PNG domain objects from the MVP visual system entirely
- ISSUE-08R replaces PNG graph nodes with clean Obsidian-like SVG domain nodes
- Mini-map is deferred until Observatories or higher graph density justify it
- SVG topology is acceptable for MVP Explore because the graph is small and typographic clarity matters
- Three.js/R3F can be revisited later for large-scale Observatory topology

**Why:**
- The first authenticated experience should explain RAi’s ecosystem before asking users to create an Observatory
- `/explore` communicates RAi’s structure and value
- `/create` without context feels like an empty placeholder
- The topology should remain structured for future expansion: RA → Domains now, Domains → Observatories later

**Trade-off:** This introduces temporary hybrid direction in docs while older map-oriented issues remain for historical context.

**Revisit:** Yes — when Observatory-density and graph complexity materially increase.

---

## DL-27 — PNG Domain Objects Removed from MVP Visual System

**Decision:** PNG domain object assets (`apps/web/public/domain-objects/**`) are removed from the RAi MVP visual system. The Start Page no longer renders a PNG-based domain showcase, the Hero no longer renders a decorative RA PNG, and the asset tree is deleted. The canonical Domain treatment for MVP is the SVG topology on `/explore` (DL-26). Domain visuals beyond the topology are deferred to a future visual system.

**Why:**
- The PNG showcase was a placeholder treatment. With `/explore` now the primary post-auth topology surface (DL-26), the SVG nodes already carry Domain identity; a parallel PNG showcase on the Start Page is redundant and visually inconsistent.
- The PNG assets were not a stable visual system. Removing them now prevents accidental dependence in further work and clears space for a deliberate visual treatment when one is designed.
- Minimising MVP surface area: every retained asset has to be maintained, documented, and re-evaluated. Deferring is cheaper than carrying.

**Trade-off:** The Start Page narrative loses a Domain-focused section in the short term. This is acceptable: the post-auth `/explore` surface is the canonical place to encounter Domains, and the Start Page narrative still flows Hero → How it Works → CTA → Footer.

**Revisit:** Yes — when a deliberate visual system for Domains (illustration, motion, or 3D) is designed.

**See also:** DL-26, ISSUE-08R, ISSUE-08R.3.

---

## DL-28 — TopBar Canonical Roles

**Decision:** The TopBar is the app-wide navigation chrome. It is navigation, not a surface for a primary CTA. The RAi logo always routes to `/`. The right-side actions are auth-aware and respect a 3-element discipline:

- guest               → About · Log in · Get Started
- authNoObservatory   → Explore · About · Sign out
- authWithObservatory → Explore · Dashboard · Sign out

**Why:**
- The earlier auth-aware TopBar (ISSUE-08R.1) doubled the Create-Observatory CTA on /explore: once in TopBar and once in ExploreInfoPanel. Two primary CTAs on the same surface dilute intent.
- Logo destinations on About are non-standard. Logo = home is the universally recognized pattern and is what founder review expected.
- Treating TopBar as navigation only keeps the bar stable while the rest of the product evolves (dashboard chrome, observatory public page chrome, etc.).

**Trade-off:** Authenticated users see no top-bar primary CTA. The primary entry point for users without an Observatory is the ExploreInfoPanel CTA on /explore (which already routes to /create). This is an explicit centralization of intent, not a regression.

**Revisit:** Yes — when the dashboard chrome (ISSUE-12) introduces a full account menu. Sign out can then be folded into that menu, and the right-side block can shrink back to two elements for authenticated states.

**See also:** DL-26, DL-27, ISSUE-08R, ISSUE-08R.4.

---

## DL-29 — RAi Premium Glass UI Direction

**Decision:** RAi adopts a Premium Dark Glass Intelligence Interface for key product surfaces. The style is deep black-blue, calm, restrained, and editorial: premium dark glassmorphism surfaces, transparent smoked glass cards/panels, beveled rounded edges, subtle inner reflections, thin luminous borders, and soft restrained glow.

**Applies to:**
- `/create` (first implementation target)
- Dashboard panels
- Observatory panels
- Settings/account panels
- Important product cards
- Explore info panels where appropriate

**Does not mean:**
- Not every card becomes glass
- Publication reading surfaces remain readability-first
- Marketing/Start pages must not become noisy glass collages
- No noisy glass textures
- No cheap sci-fi HUD styling
- No random decorative graphics inside cards
- No PNG decorative domain objects

**Implementation sequence:**
1. Docs approval first
2. Design tokens
3. Shared primitives: `GlassCard`, `GlassPanel`, `GlassButton`, `PageShell`
4. `/create` as first test screen
5. No full-app redesign in one pass

**Why:**
- Preserves RAi's premium editorial identity while giving product surfaces a coherent depth system
- Creates a reusable UI foundation instead of ad-hoc per-screen styling
- Reduces implementation risk by sequencing rollout from one controlled screen

**Trade-off:** Some screens temporarily remain on older surface treatment during migration. This is intentional and safer than app-wide redesign.

**Revisit:** Yes — after `/create` rollout validates tokens/primitives quality across dashboard and settings surfaces

---

## DL-30 — RAi Graph UI Direction

> **Partially superseded by DL-35 (PATCH-PIVOT-02):** the Level 1 clause
> "No Observatory nodes on current `/explore`" no longer holds — under the
> pivot (DL-31), Observatories are first-class nodes on the Explore
> topology. The rest of DL-30 (SVG for Level 1, no Three.js/R3F, no
> WebSocket, Level 2 evaluation criteria) remains in force.

**Decision:** RAi adopts a two-level graph strategy.

**Level 1 — Current `/explore` (MVP):**
- `/explore` remains SVG topology
- Scope: RA → Domains
- RA is the center node
- 7 Domains are SVG nodes around RA
- No Three.js/R3F for current `/explore`
- No 3D force graph for current `/explore`
- No Observatory nodes on current `/explore`
- No WebSocket/real-time graph for current `/explore`

**Level 2 — Future Observatory / Agent Graph Cockpit:**
Future high-density graph surfaces may evaluate:
- `react-force-graph-3d`
- `three`
- `3d-force-graph`
- `d3-force-3d`

Only when product needs exist (Observatory nodes, agent/task nodes, publication/proof links, analytics panel, cockpit-style dashboard).

**Rules:**
- Graphs must communicate structure and product meaning, not spectacle
- No heavy 3D graph on simple marketing/static pages
- No WebSocket/real-time graph until product need exists
- No cosmic/game HUD direction
- No decorative graph for aesthetics-only

**Supersession:** This decision **supersedes DL-10 for current `/explore` implementation**. DL-10 remains historical/long-term context and does not require Three.js/R3F for current `/explore`.

**Why:**
- Current `/explore` graph is small and requires typographic precision and controlled readability
- SVG is the fastest, clearest MVP topology implementation for RA → Domains
- Advanced graph stacks should be introduced only with real complexity and density

**Trade-off:** Visual spectacle is reduced in the short term; clarity and product meaning are improved.

**Revisit:** Yes — when high-density graph requirements are product-proven

---

## DL-31 — Concept Pivot: RAI as a Universe of Observatories

**Decision:** RAI is repositioned from an AI-research publication platform to a universe of observatories: art-story presentations of real places (a castle, a restaurant, a street, an event, a business) and virtual worlds (generative art, imagined spaces, any format), published by people and verified by community. The 7 Domains are retained as the thematic structure of the universe. This decision supersedes prior concept framing wherever they conflict; see `docs/concept-pivot.md` for the full concept.

**Also decided:**
- DL-25 is retained and reinterpreted, not replaced: the platform shows stories, coordinates community verification, settles reputation — and never executes anything itself.
- Community mechanics (comments, contestation, DAO-style resolution, ambassador monetization) are future scope: documentation only, never UI in this patch.

**Why:**
- Knowledge about places is scattered across social posts, map reviews, and the memories of guides; no space lets the story of a place live as one coherent, art-directed presentation.
- The observatory model (public identity + published artefacts + community verification + reputation) transfers intact to place-stories; the platform mechanics survive the pivot.
- Domains as thematic regions give the universe structure without inventing new taxonomy.

**Trade-off:** Existing docs carry AI-research-era framing until progressively updated. PIVOT NOTE banners mark the superseded documents rather than rewriting everything at once.

**Revisit:** No — this is the product direction. Refinements arrive as successor decisions.

**See also:** `docs/concept-pivot.md`, DL-25, DL-32, DL-33, DL-34.

---

## DL-32 — Terminal UI and Dual Theme

**Decision:** The canonical UI frame is the RAI Terminal — a one-page, full-viewport frame (header bar · universe canvas · status line) hosting the living universe on `/` and `/explore`. Dark and Light themes are both first-class: dark remains the default; light is a "paper terminal" (warm paper surfaces, graphite text, same layout discipline). This supersedes "dark mode only in MVP".

**Mechanics:**
- Theme is a `data-theme` attribute on `<html>`, persisted in `localStorage['rai-theme']`, applied by a tiny pre-hydration inline script (no flash), toggled from the terminal header.
- All chrome consumes semantic tokens; the light theme redefines only the semantic token layer in `globals.css`. Domain identity colors stay as-is in both themes.

**Why:**
- A one-page terminal makes the universe the product surface instead of a page inside a marketing site.
- Place-stories are read in daylight contexts (travel, restaurants, walking around); a paper theme is a product requirement, not a preference toggle.
- The token system was built for exactly this: one semantic layer, two value sets.

**Trade-off:** Every existing surface must be legible in both themes, which constrains future hard-coded styling. Enforced by keeping hex literals confined to `globals.css`.

**Revisit:** Yes — if theme maintenance cost outweighs usage.

**See also:** DL-28 (TopBar roles preserved in the terminal header), DL-29, DL-31.

---

## DL-33 — Living Universe Motion (amended in PATCH-PIVOT-02)

> **Amended:** the original PATCH-PIVOT-01 version of this decision authorized a
> background starfield ("slow background twinkle") and cosmic breathing. Founder
> review rejected that direction: the starfield read as a dirty screen (especially
> in the light theme) and violated the product's own anti-cosmic art direction.
> The decision is rewritten below; the successor aesthetic is DL-37.
>
> **Amended again in PATCH-PIVOT-03:** the motion vocabulary below is extended by
> DL-37 (Living Crystal Graph): luminance breathing on orbs and VERY slow drift of
> the structural depth rings are now part of the allowed set. The starfield remains
> forbidden.

**Decision:** The Explore canvas has NO starfield and NO cosmic imagery. Its motion is a living-instrument language (DL-37): the RA heartbeat (warm pulse plus a single soft ripple every 12–16s), staggered breathing on active domain nodes, a very low-contrast flowing current along RA↔active-domain edges with an occasional brighter packet, and signature-driven pulses on observatory nodes. This remains a scoped exception to the "no looping animations on idle UI" rule; it applies to the Explore topology canvas only and must respect `prefers-reduced-motion` (static fallback must still look composed in both themes). All other UI keeps existing motion restrictions.

**Why:**
- A universe of stories that sits perfectly still reads as a diagram; life must come from rhythm and data-flow, not from decor.
- A starfield is decor: it added noise, read as grime on paper surfaces, and contradicted the "not a cosmic scene" rule in docs/visual-reference.md.
- Opacity/transform/stroke-dashoffset-only CSS animation keeps the cost negligible and preserves pan/zoom performance.

**Trade-off:** A permanent low level of visual activity on the primary surface. Bounded by sparseness rules (roughly one packet visible at a time, sub-1Hz breathing cycles, one RA ripple per ~14s).

**Revisit:** Yes — if user feedback reads the motion as noise rather than life.

**See also:** DL-31, DL-32, DL-36, DL-37, docs/visual-reference.md motion rules.

---

## DL-34 — World Mode Deferred

**Decision:** The real-world interactive map mode and the mode switcher between it and the virtual universe are deferred to a dedicated future patch. Working placeholder name in docs: "World Mode" (final name undecided — do not invent one). No World Mode UI ships in this patch: no map surface, no switcher, no dead controls.

**Why:**
- The virtual universe must prove the observatory/art-story model first; a map mode multiplies scope without validating anything new.
- A mode switcher with one working mode is a broken promise in the UI.
- Real-world pinning has its own hard problems (geodata, clustering, permissions) that deserve a dedicated patch.

**Trade-off:** "Pinned to the world" exists in concept documentation before it exists in product. Accepted: the virtual universe carries the concept until World Mode lands.

**Revisit:** Yes — when PATCH-PIVOT-01 is validated and World Mode gets its own patch.

**See also:** DL-31, `docs/concept-pivot.md`.

---

## DL-35 — Observatories Are First-Class on the Explore Topology

**Decision:** Observatory nodes render on the Explore topology as first-class entities: signature-styled nodes (color, nodeStyle, ambient effect from `VisualSignature`) tethered to their domain, present in the Registry rail, selectable into the Inspector, and openable as full-screen art-stories. This supersedes the DL-30 Level 1 clause that intentionally omitted Observatory nodes from `/explore`.

**Why:**
- Under DL-31 the product IS a universe of observatories; a topology without them shows structure but no life and no content.
- The MVP graph stays small (RA + 7 domains + a handful of observatories), so DL-30's density concerns do not yet apply.
- Reachability of stories from the graph is the core loop; the omission clause blocked it.

**Trade-off:** The Level 1 graph grows in element count earlier than DL-30 planned. Bounded for now by the two mock observatories; the density criteria in DL-30's Level 2 section still govern when a heavier graph stack is considered.

**Revisit:** Yes — when real Observatory data lands and node counts grow past what a hand-tuned SVG can carry.

**See also:** DL-30 (superseded clause), DL-31, DL-36.

---

## DL-36 — Explore Terminal Layout

**Decision:** Explore is an information terminal, not a full-bleed canvas. Desktop regions: a command strip (wordmark, context label, live readouts computed from fetched data, theme toggle, DL-28 auth-aware nav), a Registry rail listing domains and observatories, a framed Topology panel hosting the graph (with a quiet zoom/reset control), a docked persistent Inspector for the selected entity (RA / domain / observatory) carrying the auth-aware CTA and the `Open art-story` entry, and a bottom Activity strip (mock events until a real feed exists). The graph is one panel among several. Below ~1024px the Registry/Inspector/Activity collapse into a tabbed bottom sheet beneath the topology panel.

**Why:**
- Founder review: layering ambient motion over the same full-bleed canvas did not change the Explore UX — it made a screensaver. A terminal gives the graph an instrument's frame and gives data a place to live.
- A docked Inspector plus a Registry rail makes every entity reachable by list as well as by node — reachability no longer depends on hitting a small SVG target (see the PATCH-PIVOT-02 Phase 0 diagnosis).
- The layout scales: real observatories, activity feeds, and search have obvious homes without redesign.

**Trade-off:** More chrome around the graph; the "infinite canvas" feeling is reduced on desktop. Accepted — the terminal frame is the product's identity (DL-32), and pan/zoom inside the panel is preserved intact.

**Revisit:** Yes — when real Observatory/activity data replaces the mocks and usage shows which regions earn their space.

**See also:** DL-28, DL-32, DL-35, DL-37.

---

## DL-37 — Living Crystal Graph Aesthetic (amended in PATCH-PIVOT-03)

> **Amended:** the PATCH-PIVOT-02 version of this decision ("Living Intelligence
> Aesthetic") prescribed a restrained, low-glow instrument and forbade all
> rotating/orbiting elements. Founder review supplied a visual reference and a
> stronger target; this amendment defines the canonical Explore look as the
> **Living Crystal Graph**. Two stances change deliberately: (1) glow is now
> embraced as luminance that encodes node identity and activity (within a
> performance budget); (2) structural elliptical depth rings with VERY slow
> orbital drift are now allowed — they cue depth and life. Spinning
> targeting/radar elements remain forbidden.

**Decision:** The Explore topology canvas is the Living Crystal Graph: a luminous, depth-cued, data-bearing rendering. RA is a faceted warm-gold crystal hub with a soft inner light and bloom; domains are glowing identity-colored orbs (active larger and brighter, coming-soon dim and cool); observatories are smaller signature-driven glowing satellites; edges are thin, gently curved, luminous gradient strokes (hub-white toward node color); 1–2 faint elliptical orbit rings behind the graph cue depth and drift very slowly. Every luminous element is data-bearing — a real node, a real edge, or a structural depth cue. Richness scales with the real universe; nothing is fabricated to look denser.

**Founder reference (described so the intent survives without images in-repo):** a luminous knowledge-graph instrument — a bright faceted glowing crystal at the center from which everything radiates; small glowing colored orbs (warm amber, magenta, violet, yellow, occasional blue) with soft bloom, sized by importance; very thin luminous white-to-color gradient edges fanning out densely like a dandelion; faint elliptical orbit rings and gently curved lines giving a slow-drifting spherical depth; near-black background; dark rounded pill controls along the canvas edge. The feeling: a living, luminous, self-aware relational instrument — dense, deep, calm. RAI adopts the LANGUAGE at its current scale; it does not copy the product, and RA stays warm-gold (never magenta).

**Binding anti-cliché list (canvas must contain NONE of):** decorative background starfield or ambient dots unrelated to data; radar sweeps or scanning lines; targeting reticles, crosshairs, or bracket/corner "HUD frames" around nodes; hexagon grids, matrix-rain, scanlines, or circuit-board decoration; neon as a primary color; fake AI action controls ("Suggest Nodes", "Analyze Cluster" — nothing without a real backend); busy or constant fast motion. Changed from PATCH-PIVOT-02: slow orbital-ring drift is permitted; spinning targeting/radar elements remain forbidden. If it resembles a sci-fi movie HUD, it is wrong.

**Why:**
- The flat, sparse instrument read as unfinished rather than calm; luminance tied to identity and activity makes the graph feel alive without decoration.
- Depth cues (rings, curvature, slow drift) give the universe a sense of space that a flat plane cannot.
- Anchoring every glowing element to data keeps the richness honest — density arrives with real observatories, not ornaments.

**Trade-off:** More visual complexity per node (gradients, blooms, filters) requires an explicit performance budget: limited filtered elements, GPU-friendly animation properties only, and capped element counts so pan/zoom stays smooth.

**Revisit:** Yes — alongside DL-38 when node density approaches what hand-tuned SVG can carry.

**See also:** DL-29, DL-32, DL-33 (amended), DL-36, DL-38.

---

## DL-38 — Topology Rendering Engine

**Decision:** The Explore topology is rendered in SVG + CSS. The Living Crystal Graph (DL-37) is a stylized 2.5D interpretation — glowing orbs via radial gradients and SVG glow filters, luminous gradient-stroke curved edges, a faceted SVG crystal hub, elliptical depth rings, gentle CSS drift. A true-3D rendering engine (`react-force-graph-3d`, `three-globe`, or raw WebGL) is a deferred Level 2 decision, to be taken only when node density and product need justify it AND the dependency and performance trade-offs are explicitly accepted. No 3D engine, no canvas/WebGL, and no new dependencies in the current implementation.

**Why:**
- At the current scale (RA + 7 domains + a handful of observatories) SVG delivers the luminous language with zero dependency cost and full CSS-Modules/theme/token integration.
- A 3D engine is a heavy, sticky dependency; adopting it for ~10 nodes would be spectacle-driven, which DL-30/DL-37 forbid.
- Deferring keeps the graduation path honest: real density first, engine second.

**Trade-off:** True volumetric depth, physical camera motion, and force layouts are out of reach until the engine decision is taken. Accepted — the 2.5D language carries the intent at MVP scale.

**Revisit:** Yes — when real Observatory counts make the SVG budget (element count, filter cost) measurably strain pan/zoom smoothness.

**See also:** DL-30, DL-37, docs/visual-reference.md Topology Rendering Levels.

---

## DL-39 — Virtual/Real World Lifecycle (recorded, not built)

**Decision:** The universe is two halves of one lifecycle. A **virtual** observatory presents an idea before it exists in the world; a **real** observatory is tied to an existing place. An idea can graduate from virtual to real when it is realized. An observatory will carry a `world` field (`virtual` | `real`). Nothing is built now: the Explore virtual/real toggle and the real-world Earth map are future patches (World Mode track, DL-34), and the database `world` column is deferred until the Observatory model lands.

**Why:**
- The pivot's two-worlds framing (docs/concept-pivot.md §2) needs a data-model anchor so future patches converge on one vocabulary.
- Graduation (virtual → real) is the product's most distinctive lifecycle moment; naming it early keeps Create/Explore/World Mode designs aligned.

**Trade-off:** A recorded field that does not exist yet can drift from reality. Mitigated by deferring the column to the same patch that ships the Observatory model.

**Revisit:** Yes — when the Observatory schema ships.

**See also:** DL-31, DL-34, DL-40, docs/concept-pivot.md.

---

## DL-40 — Idea-to-Reality Funding (future direction — recorded, not built)

**Decision:** A future, non-custodial, transparent funding path may let a community fund the realization of a published idea (a virtual observatory graduating to real — DL-39). Binding constraints recorded now: funds are NEVER routed to a founder's personal wallet; realization is controlled by protocol and happens transparently; the platform shows, coordinates, verifies, and settles — it never executes and never takes custody (DL-25). This is a direction only: it is NOT scoped, NOT designed, and NOT built here, and it carries open legal and technical questions (jurisdiction, escrow mechanics, verification of realization) to be resolved in its own track before any implementation.

**Why:**
- The lifecycle in DL-39 naturally raises "who pays for graduation"; recording the non-custodial constraint NOW prevents future designs from drifting toward custodial or founder-benefiting models.
- DL-25 alignment must be structural, not aspirational — writing it into the earliest record makes it a hard requirement for any future funding design.

**Trade-off:** Recording a direction this early risks implying a commitment. Mitigated by the explicit not-scoped/not-built status and the open-questions list.

**Revisit:** Yes — in a dedicated track, only after the Observatory model and DL-39 lifecycle exist in product.

**See also:** DL-03 (no Web3 in MVP — still in force), DL-25, DL-39.

---

## DL-41 — Observatory Create Endpoint (`POST /api/v1/observatories`)

**Decision:** The apps/api freeze is lifted for ONE dedicated endpoint: `POST /api/v1/observatories` (auth required) creates the base observatory for the logged-in user. It persists base fields only — name, displayName, type, publicMode, domainIds, bio, socialLinks, visualSignature. NO schema migration: every persisted column pre-exists (ISSUE-03). One-per-user is enforced twice: a handler guard (existing observatory → 409) and the `Observatory.userId @unique` DB backstop (Prisma P2002 → 409). Name uniqueness likewise: shared validation + re-check + P2002 on `name` → 409. No credit cost (CreditTransaction/creditsBalance untouched). Board/media persistence, the `world` column (DL-39), and file/object storage remain deferred to a future full-stack issue, which must choose a storage provider before it can land.

**Why:**
- The create→dashboard loop is the first real write of the pivot; deferring it further would make the Studio a mock.
- All columns already exist, so persistence costs one route — no migration risk.
- Reusing the `/api/me` auth context and the ISSUE-05 shared naming utilities keeps validation single-sourced.

**Trade-off:** The API freeze is softened by precedent. Bounded: the endpoint is additive, touches no other route, and the freeze re-applies after this patch.

**Revisit:** Yes — when the board/media content model and storage provider are decided.

**See also:** DL-25, DL-39, ISSUE-05, docs/architecture.md.

---

## DL-42 — Observatory Studio + Premium Glass Primitives (DL-29 rollout)

**Decision:** `/create` is the Observatory Studio: a multi-step creation environment (World → Identity → Board → Signature + Preview → Finish) with a persistent live preview that renders the draft both as a public observatory view (in the spirit of the two mock art-stories) and as a Living Crystal Graph node (DL-37). The glass primitive set — `GlassCard`, `GlassPanel`, `GlassButton`, `PageShell` — lands here as the first DL-29 test surface, theme-aware (smoked glass on dark, frosted paper on light, ≤2 blur depths). The Studio's `world` selection implements the Virtual/Real World Lifecycle (DL-39) in the LOCAL draft only; the board/room blocks and photos live in `localStorage` (photos session-only — no storage provider exists) and will attach to the observatory when board publishing ships. The visual signature is chosen manually — no AI generation.

**Why:**
- The Studio is where the pivot becomes participatory; it must feel like the terminal, not a form.
- DL-29 prescribed `/create` as the first glass rollout surface; primitives built here are reused product-wide later.
- Local-first board keeps the deferred content-model decision honest instead of inventing a throwaway schema.

**Trade-off:** Board and photos do not survive account/device changes yet. Stated honestly in the UI.

**Revisit:** Yes — when board publishing ships.

**See also:** DL-29, DL-37, DL-39, DL-41.

---

## DL-43 — Explore Topology Renderer: WebGL 3D (`react-force-graph-3d` + Three.js)

**Decision:** The Explore topology renderer is a real WebGL 3D graph built on `react-force-graph-3d` (Three.js-based), lazy-loaded client-only (`next/dynamic`, `ssr: false`) and code-split to the Explore surface. This SUPERSEDES, for the Explore topology renderer only: DL-38 (SVG + CSS rendering), the DL-37 Living Crystal Graph SVG implementation (its visual INTENT — luminous hub, identity orbs, depth, calm life — carries over into 3D), the DL-30 Level-1 no-Three.js clause, and the historical DL-10 framing. New dependencies are permitted scoped to this surface: `react-force-graph-3d` (pinned 1.29.1) reusing the pre-existing `three`; nothing else. Post-processing bloom via the library composer + UnrealBloomPass is allowed. WebGL-unavailable environments get a composed fallback message. The 3D orbit/zoom controls replace the SVG CTM pan/zoom internals (ISSUE-08R.2), which are removed with the SVG renderer.

**Founder target (recorded so intent survives):** a luminous 3D relational graph — a bright faceted crystal hub (RA, warm gold emissive, visually dominant), 7 glowing identity-colored domain orbs arranged in depth, smaller observatory orbs tethered near their domains, thin luminous radiating edges with subtle animated flow, true perspective depth, soft bloom, slow idle auto-rotate, user orbit/zoom/pan, near-black space background. Living, deep, calm, premium — luminous, not flat-neon.

**Why:**
- The SVG interpretation did not achieve the depth-lit rotatable target; founder review requires real 3D.
- `react-force-graph-3d` matches the target shape (hub + radiating colored glowing nodes + orbit controls) at minimal integration cost.
- Lazy client-only loading keeps the dependency off every other route and out of SSR.

**Trade-off:** A heavy dependency enters the web bundle (code-split); the battle-tested SVG pan/zoom hardening is retired in favor of library orbit controls. Accepted deliberately.

**Revisit:** Yes — if bundle or mobile performance costs outweigh the visual value.

**See also:** DL-10, DL-30, DL-37, DL-38 (all superseded in part), DL-44, DL-45.

---

## DL-44 — All 7 Domains Are Full Graph Nodes; `active` Is a Visual State

**Decision:** The Explore graph renders all 7 domains as full 3D nodes with labels, regardless of `active`. Inactive domains are dimmer and cooler (lower emissive, muted color) but never hidden. The panel Filter control defaults to dimming, not removal. At MVP launch the seed activates 3; activation changes visual state only — never graph shape.

**Why:** the universe must look complete and correct with all 7 rendered; hiding nodes made the graph read as sparse and broken, and activation should not restructure the space.

**Trade-off:** Inactive domains are visible before they have content. Accepted — "coming" is part of the story.

**Revisit:** No — this is the graph contract.

**See also:** DL-43, DL-45.

---

## DL-45 — Observatories Inherit Their Parent Domain Color

**Decision:** An observatory node base color = its parent domain identity color (Wawel → vorda, Signal Garden → draxis), with the observatory VisualSignature accent used only for secondary emphasis (ring/glow accent). Each observatory is tethered to its domain by an edge.

**Why:** color = belonging; the graph must read as domains with satellites, not a confetti of unrelated hues. The signature still individualizes without breaking the color grammar.

**Trade-off:** Signature primary colors no longer drive node color on the graph (they still drive the art-story hero and studio previews).

**Revisit:** Yes — when real observatories arrive in volume and need finer differentiation.

**See also:** DL-37, DL-43, DL-44.

---

## DL-46 — Real Observatories in Discovery; Mocks Become Demo-Seed

**Decision:** A public list endpoint `GET /api/v1/observatories` (no auth; `publicMode: true` only; base fields: id, name, displayName, type, domainIds, visualSignature, reputationScore, publicationsCount; limit 500) feeds the Explore 3D graph. The graph renders real observatories as nodes colored by their parent domain (first of `domainIds`) with the VisualSignature accent as secondary emphasis, tethered to that domain — the same language as DL-45. The two hand-written observatories (Wawel, Signal Garden) become **demo-seed**: the client renders real observatories PLUS the mocks, de-duplicated by `name` (a real observatory replaces a same-named mock), and falls back to the mocks if the endpoint fails so the universe is never empty. This further supersedes the DL-30 clause that omitted observatory nodes at Explore Level 1 (already partly superseded by DL-35/DL-43). No schema change: all columns pre-exist.

**Why:**
- The pivot is a universe of observatories; a user's created observatory must actually appear in the universe.
- Keeping the mocks as demo-seed avoids an empty graph in early days while real content accrues.
- A public discovery endpoint is the minimum surface for the graph and future feed/search — base fields only, no new infra.

**Trade-off:** Real observatories with no board yet open to an empty-state art-story (board persistence is deferred, DL-42). Node placement for real observatories is a deterministic hash of the name until a real layout system exists.

**Revisit:** Yes — remove the demo-seed mocks once enough real observatories exist; add a proper layout/placement system as density grows.

**See also:** DL-30 (superseded clause), DL-35, DL-42, DL-43, DL-45, DL-47.

---

## DL-47 — Dashboard Baseline + `me/observatory` Read/Update

**Decision:** `/dashboard` becomes the owner's real screen (auth-gated; no-observatory → `/create`), built from the DL-29 glass primitives: an identity card, an "as a node" preview (a static SVG orb in the graph language — no second heavy 3D mount), an editable identity form, and a read-only local board-draft section (honest "board publishing is coming" copy). Two auth-required endpoints back it, reusing the `/api/me` auth context and the create-route validators: `GET /api/v1/me/observatory` returns the caller's full observatory (base fields) or 404; `PATCH /api/v1/me/observatory` updates base fields (displayName, bio, domainIds [0–2 active], socialLinks, publicMode, visualSignature, type). **`name` is immutable after creation** — attempts to change it are rejected. No schema change, no migration.

**Why:**
- Owners need to see and edit their observatory; the create flow was write-once with no follow-up surface.
- Reusing the POST validators keeps create and update in lockstep.
- Immutable `name` protects the permanent public address (`rai.app/@name`).

**Trade-off:** The dashboard is intentionally minimal — no Systems/Publications/Settings sub-screens, and the board is still local-only (DL-42) until a storage decision lands.

**Revisit:** Yes — when the board/media content model and the dashboard sub-screens ship.

**See also:** DL-29, DL-41, DL-42, DL-46.

---

## DL-48 — Single-World UI Until World Mode Ships

**Decision:** The virtual/real distinction is hidden from the current UI. Every observatory presents simply as an "observatory" living in the single existing (virtual) universe: the world/kind tags (`place` / `world` / `obs`) are removed from the Registry rail, the Inspector, and the art-story overlay; the two demo observatories no longer present as two different worlds; and copy that implied a real-world anchor is softened to neutral universe language. The `world` field (DL-39) and the `ObservatoryKind` `real-place`/`virtual-world` values are RETAINED in the data model/types/studio draft as forward-looking flags — they are simply not shown or implied until World mode (the Earth map + virtual↔real toggle) ships.

Two related graph changes ship in the same patch, amending the PP-05/PP-06 topology entries:
- **Scene background follows the theme literally** (amends DL-43 / PP-06 A1): the 3D scene reads the panel's `--surface-canvas` token at runtime and reacts to `data-theme`, so it is a literal near-black in dark and a literal paper/off-white in light — superseding the PP-06 "deep neutral scene in both themes" choice. Light-theme bloom is lowered so bright nodes read on the light scene; node base colors carry identity regardless.
- **Persistent in-scene node labels removed** (amends PP-06 A4): the graph shows only glowing orbs + edges; identity appears on hover/selection in the Inspector and as the named Registry list. Hover still highlights the node (scale/emissive) so it reads as interactive.

**Why:**
- Showing virtual vs real implies World mode exists; it does not yet. An honest UI presents one universe until the second mode ships.
- Floating 3D labels cluttered the scene and fought the bloom; the Inspector + Registry already carry identity clearly.
- A theme-literal scene (black in dark, light in light) is what founder review wanted; the "deep neutral in both" compromise read as a lilac/grey wash.

**Trade-off:** Observatory nodes carry no in-scene name — discovery leans on hover/click + the Registry. Accepted: the terminal already pairs the graph with a named list and a docked Inspector. The studio `/create` "World" step still lets a creator tag a local draft `world` (the DL-39 forward flag, never sent to the API or shown on the graph) — left as-is under this patch's Explore-only scope; revisit when World mode ships.

**Revisit:** Yes — when World mode ships, restore the virtual/real distinction (map, toggle, tags) intentionally.

**See also:** DL-34, DL-39, DL-43, DL-45, DL-46.
