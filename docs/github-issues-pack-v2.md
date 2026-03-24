# RAi — GitHub Issues Pack v2

> Complete set of GitHub issues for MVP.
> Each issue is ready to copy into GitHub.
> Execution order: ISSUE-00 → ISSUE-16.
>
> Workflow: Claude generates Cursor prompt → Cursor executes →
> Founder brings diff → Claude reviews → merge or fixes.

---

## Issue Map

| ID | Title | Phase | Unlocks |
|---|---|---|---|
| ISSUE-00 | Project Rewrite & Documentation Layer | Foundation | Cursor has correct context |
| ISSUE-01 | Monorepo Scaffold | Foundation | Phase A |
| ISSUE-02 | Minimal Infrastructure + CI/CD | Foundation | Auto-deploy active |
| ISSUE-03 | Database Schema + Seed | Foundation | Data contract set |
| ISSUE-04 | Authentication System | Auth | Phase B open |
| ISSUE-05 | Identity & Nickname Logic | Auth | Phase B complete |
| ISSUE-06 | Start Page | Public UI | First public screen |
| ISSUE-07 | About + Login + Get Started Screens | Public UI | Auth screens ready |
| ISSUE-08 | Map Foundation (WebGL Canvas) | Map | Map renders |
| ISSUE-09 | Map Interactions + Navigation Layer | Map | Map fully interactive |
| ISSUE-10 | Meta Stars on Map | Map | Milestone 2: Map is Alive |
| ISSUE-11 | Create Your Meta (3-step flow) | Creation | Meta Stars can be created |
| ISSUE-12 | Profile Dashboard | Profile | Milestone 3: First Star |
| ISSUE-13 | AI Atmosphere Generator | AI | Atmosphere system live |
| ISSUE-14 | Public Star Preview + Share | Preview | Sharing works |
| ISSUE-15 | Payments (Stripe) | Payments | Monetization live |
| ISSUE-16 | Analytics + Monitoring + QA + Production | Launch | Soft Launch ready 🚀 |

---

---

## ISSUE-00 — Project Rewrite & Documentation Layer

**Goal**

Rewrite all documentation to align with the RAi v2 world structure before any code is written. Cursor Agent cannot execute correctly without this foundation.

**Scope**

- Rewrite: `docs/mvp-contract.md`, `docs/architecture.md`, `docs/decision-log.md`, `docs/visual-reference.md`
- Create: `docs/world-structure.md`, `docs/planet-definitions.md`, `docs/screens-spec.md`, `docs/future-reference.md`
- Rewrite: `ROADMAP.md`, `README.md`
- Update: `docs/backlog.md` (add new backlog items from v2 concept)

**Out of Scope**

- No code. No configuration. No packages.
- Folder structure — in ISSUE-01.

**Dependencies**

- None

**Acceptance Criteria**

- [ ] `docs/world-structure.md` correctly describes RA, Planets, Satellites, Meta Stars
- [ ] `docs/planet-definitions.md` contains all 7 planets with names, themes, and seed positions
- [ ] `docs/mvp-contract.md` reflects v2 scope (no enterable worlds, no Web3, Planets as hubs)
- [ ] `docs/future-reference.md` locks spatial traversal reference as post-MVP
- [ ] `docs/architecture.md` reflects new entity set (Planet, Satellite, Star v2)
- [ ] `ROADMAP.md` reflects new phases and milestones

**Merge Checklist**

- [ ] No MVP scope items in `docs/future-reference.md`
- [ ] All 7 planets defined in `docs/planet-definitions.md`
- [ ] `docs/mvp-contract.md` does not mention enterable worlds as MVP features

---

## ISSUE-01 — Monorepo Scaffold

**Goal**

Create the full monorepo structure with TypeScript, ESLint, and Prettier — the foundation for all subsequent code.

**Scope**

- pnpm workspaces: `apps/web` (Next.js 14 App Router), `apps/api` (Fastify), `packages/shared`
- `pnpm-workspace.yaml`
- TypeScript strict mode in all three packages (`tsconfig.json` + root `tsconfig.base.json`)
- ESLint + Prettier: shared config from root
- `apps/web`: Next.js 14 initialized (empty, no pages)
- `apps/api`: Fastify initialized (empty, no routes)
- `packages/shared`: empty package with `index.ts`
- Root `package.json` with scripts: `dev`, `build`, `typecheck`, `lint`

**Out of Scope**

- No business code, UI components, or API routes
- Database, auth, infrastructure — in following issues

**Dependencies**

- ISSUE-00

**Acceptance Criteria**

- [ ] `pnpm install` completes without errors
- [ ] `pnpm -r dev` starts both apps locally
- [ ] `pnpm typecheck` passes in all packages
- [ ] `pnpm lint` passes in all packages
- [ ] Folder structure matches `docs/architecture.md`

**Technical Notes**

- Next.js: `14.x`, App Router (not Pages Router)
- Fastify: `4.x` | TypeScript: `5.x` strict | pnpm: `8.x` | Node.js: `20.x`
- `packages/shared/src/types/` — will hold AtmosphereParams, StarType, Planet types

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Structure matches `docs/architecture.md`
- [ ] `packages/shared` correctly referenced from both apps

---

## ISSUE-02 — Minimal Infrastructure + CI/CD

**Goal**

Connect automated deploy pipeline and a minimal backend service so every merge automatically reaches production.

**Scope**

- GitHub Actions CI: `.github/workflows/ci.yml` — lint + typecheck on every PR
- GitHub Actions CD: `.github/workflows/cd.yml` — deploy on push to `main`
- Vercel project connected to repo (frontend deploy)
- Railway: Node.js API service provisioned and connected
- `GET /api/health` endpoint in Fastify → `{ status: "ok", timestamp: "..." }` → 200
- Health check verified in CD pipeline after deploy

**Out of Scope**

- PostgreSQL, Redis — in ISSUE-03
- External service credentials (Stripe, OpenAI, Resend) — added later

**Dependencies**

- ISSUE-01

**Acceptance Criteria**

- [ ] Push to `main` → automatic deploy on Vercel and Railway
- [ ] PR → CI pipeline runs (lint + typecheck)
- [ ] `GET https://api.[domain]/api/health` → 200 on production
- [ ] Failed typecheck on PR → CI fails, merge blocked

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Production health endpoint returns 200
- [ ] CI blocks PRs with TypeScript errors

---

## ISSUE-03 — Database Schema + Seed

**Goal**

Define the complete data architecture for MVP via Prisma schema, run migrations, and seed the 7 Planets — the only moment where the world structure contract is translated into DB reality.

**Scope**

- Railway: PostgreSQL provisioned, `DATABASE_URL` stored
- Redis (Upstash or Railway): `REDIS_URL` stored
- Prisma initialized in `apps/api`, connected to PostgreSQL
- Full schema with all tables:
  - `User` (id, email, name, planTier, creditsBalance, stripeCustomerId, createdAt)
  - `Star` (id, userId, name unique, displayName, type, publicMode, atmosphereParams JSONB, planetIds[], bio, createdAt)
  - `Planet` (id, name, slug unique, description, theme, positionX, positionY)
  - `Satellite` (id, planetId, name, description)
  - `AIGeneration` (id, userId, starId, prompt, resultParams JSONB, creditsUsed, status, createdAt)
  - `CreditTransaction` (id, userId, amount, type, referenceId, createdAt)
  - `Subscription` (id, userId, stripeId, plan, status, periodEnd)
  - `StarVisit` (id, starId, visitorUserId nullable, sessionId, visitedAt)
- First migration run in dev and production
- Seed script: all 7 Planets with data from `docs/planet-definitions.md`
- Seed script: 3 test users, 3 test Meta Stars
- `AtmosphereParams` type in `packages/shared/src/types/atmosphere.ts`
- `Planet` and `StarType` types in `packages/shared`

**Out of Scope**

- No API routes on top of schema
- No Prisma middleware or soft deletes

**Dependencies**

- ISSUE-02

**Acceptance Criteria**

- [ ] `prisma migrate deploy` succeeds in production
- [ ] `prisma db seed` populates DB with all 7 Planets and test data
- [ ] Prisma Studio: all tables present, data readable/writable
- [ ] `AtmosphereParams` type exported from `packages/shared`
- [ ] Planet seed data matches `docs/planet-definitions.md` exactly

**Technical Notes**

- Schema changes after this issue = new migration, never edit applied migrations
- Planet `id` values: deterministic UUIDs defined in seed, not auto-generated
- `atmosphereParams` stored as JSONB on `Star`

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] All 8 tables in schema
- [ ] Migration ran in production
- [ ] All 7 planets seeded with correct data
- [ ] Shared types exported correctly

---

## ISSUE-04 — Authentication System

**Goal**

Implement the full auth system so every subsequent endpoint can identify users and protect routes.

**Scope**

- Better Auth installed and configured in `apps/api`
- Email + password: signup, login, logout
- Google OAuth: client ID/secret, redirect URI
- Session: httpOnly cookie, secure, sameSite strict
- Fastify plugin: protected route middleware (adds `request.user` or returns 401)
- `useAuth` hook in `apps/web` (user, login, logout, isLoading)
- Email verification via Resend
- Password reset: email → token → new password
- Rate limiting on auth endpoints: 5 attempts/min per IP (Redis-based)

**Out of Scope**

- Magic link auth, MFA, admin auth
- JWT (session cookies only)

**Dependencies**

- ISSUE-03 (User table in DB)

**Acceptance Criteria**

- [ ] Signup → email verification letter arrives via Resend
- [ ] Login with valid credentials → session cookie set
- [ ] `GET /api/me` without session → 401
- [ ] `GET /api/me` with valid session → user object
- [ ] Google OAuth: redirect → callback → session → user in DB
- [ ] 6th auth attempt per minute → 429
- [ ] Password reset: email → link → new password → login

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Email verification works
- [ ] Google OAuth E2E works
- [ ] Rate limiting verified (6th request → 429)
- [ ] Protected middleware blocks without session

---

## ISSUE-05 — Identity & Nickname Logic

**Goal**

Establish the clear separation between user account identity and Meta Star identity. A user can exist without a Meta Star. A Meta Star name is permanent and separate from the account display name.

**Scope**

- After registration: user has `displayName` (derived from email prefix, editable)
- Meta Star `name` = separate permanent identifier, chosen in creation flow
- `GET /api/v1/stars/check/:name` — availability check endpoint
- Reserved words list: `admin, api, www, rai, app, help, support, login, signup, me, explore, settings, profile, create, about, static, assets, public, private`
- User without Meta Star → redirected to `/create` after login
- User with Meta Star → redirected to `/explore` after login
- Auth flow checks `user.starId` (nullable) to determine redirect

**Out of Scope**

- Meta Star creation itself — in ISSUE-11
- Profile UI — in ISSUE-12

**Dependencies**

- ISSUE-04

**Acceptance Criteria**

- [ ] New user after signup has no Meta Star (`starId = null`)
- [ ] After login without star → redirect to `/create`
- [ ] After login with star → redirect to `/explore`
- [ ] `GET /api/v1/stars/check/testname` → `{ available: true/false }`
- [ ] Reserved word check → `{ available: false, reason: "reserved" }`

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Redirect logic verified for both cases
- [ ] Availability check works for taken, available, and reserved names

---

## ISSUE-06 — Start Page

**Goal**

Build the public narrative landing page that communicates what RAi is within seconds and drives users toward registration.

**Scope**

- Full-screen atmospheric background (cosmic, static or subtle CSS animation)
- Transparent glassmorphism top bar:
  - RAi logo (clickable → `/about`)
  - "Log in" button → `/login`
  - "Get Started" button → `/signup`
- Scrollable narrative sections with scroll-reveal glass blocks:
  - What is RAi (1 section)
  - What is a Meta Star (1 section)
  - What are Planets (1 section)
  - Join the universe CTA (1 section)
- Animated roadmap section (visual timeline, no interaction needed)
- Footer: links to About, Privacy Policy, Terms, social links
- Fully responsive (mobile browser support)

**Out of Scope**

- No dynamic data from API
- No auth state
- No map rendering

**Dependencies**

- ISSUE-01

**Acceptance Criteria**

- [ ] Page renders at `/`
- [ ] Top bar links navigate correctly
- [ ] Scroll-reveal works on all glass blocks
- [ ] Page is readable on mobile (iPhone Safari)
- [ ] No console errors

**Technical Notes**

- Use Next.js App Router Server Component
- CSS scroll animations via Intersection Observer or CSS animation
- Background: static CSS or very lightweight canvas — no Three.js on Start Page

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] All nav links work
- [ ] Mobile layout verified
- [ ] Matches visual direction from `docs/visual-reference.md`

---

## ISSUE-07 — About + Login + Get Started Screens

**Goal**

Build the About screen and the auth screens (Login and Get Started).

**Scope**

**About (`/about`):**
- Full readable description of the RAi ecosystem
- Covers: RA, Planets, Satellites, Meta Stars, the map, the vision
- Clean typographic layout, no interactive elements needed
- Back/home navigation

**Login (`/login`):**
- Atmospheric background (different from Start Page)
- Centered glass card:
  - RAi logo
  - Slogan: "Claim your place in the universe."
  - Email + password fields
  - "Log in" button
  - Google OAuth button
  - Link to `/signup`
- Error states for invalid credentials

**Get Started (`/signup`):**
- Same glass card layout as Login
- Email + password + confirm password fields
- Display name field (optional, editable later)
- Google OAuth button
- Link to `/login`
- Validation and error states

**Out of Scope**

- No map rendering
- No creation flow — in ISSUE-11

**Dependencies**

- ISSUE-04 (auth endpoints)
- ISSUE-05 (redirect logic after auth)

**Acceptance Criteria**

- [ ] About page renders at `/about`
- [ ] Login works: valid credentials → session → redirect
- [ ] Signup works: new user created → redirect to `/create`
- [ ] Google OAuth works on both screens
- [ ] Error states display correctly (invalid password, taken email)
- [ ] Both auth screens work on mobile

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Login E2E works
- [ ] Signup E2E works
- [ ] Google OAuth E2E works
- [ ] Visual matches `docs/visual-reference.md`

---

## ISSUE-08 — Map Foundation (WebGL Canvas)

**Goal**

Build the base WebGL map with RA at center and all 7 Planets at their seed positions. Navigation (pan, zoom) working. This is the visual core of the product.

**Scope**

- `ExploreMap.tsx` component: Three.js scene with orthographic camera
- RA rendered at (0, 0): animated glow, soft corona, warm light emission
- 7 Planets rendered at positions from seed data: realistic sphere rendering, rim lighting, subtle atmosphere edge
- Satellite objects near parent Planets (small visual objects, no interaction)
- Pan: click-drag with inertial momentum (ease-out)
- Zoom: scroll wheel + pinch, min/max limits
- Mini-map in bottom-right corner: shows current viewport position
- Responsive canvas (fills viewport, handles resize)
- `GET /api/v1/planets` endpoint: returns all 7 planets with positions
- Mobile: simplified rendering (reduced visual complexity, touch support)

**Out of Scope**

- Meta Stars on map — in ISSUE-10
- Nav interactions — in ISSUE-09
- No user data on map yet

**Dependencies**

- ISSUE-03 (Planets in DB)

**Acceptance Criteria**

- [ ] Map renders at `/explore` with RA and 7 Planets
- [ ] Planet positions match seed data from `docs/planet-definitions.md`
- [ ] Pan and zoom work on desktop and mobile
- [ ] Mini-map shows current viewport position
- [ ] Frame time < 60ms on MacBook Air M1 (Chrome DevTools Performance)
- [ ] Map renders without errors on iPhone Safari

**Technical Notes**

- Three.js orthographic camera: `OrthographicCamera`
- RA: `MeshStandardMaterial` with strong emissive, `PointLight` for glow
- Planets: `SphereGeometry` with procedural shading, no external texture maps
- Canvas fills `100vw × 100vh`, no padding

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Performance target met (document result in PR)
- [ ] Mobile verified on real device
- [ ] Planet positions match seed data exactly

---

## ISSUE-09 — Map Interactions + Navigation Layer

**Goal**

Add the full navigation layer to the Explore screen: top nav bar, hover/click interactions on map objects, and slide-in info panels.

**Scope**

**Top navigation bar:**
- Transparent glassmorphism bar (floats over map)
- Items: RAi (logo) / Planets / Satellites / Meta Stars / Burger menu
- Burger menu: Profile → `/profile`, Settings → `/settings`, Log out
- Hover over nav items → highlights related objects on map

**Map object interactions:**
- Hover Planet → glow intensifies + tooltip (name, theme)
- Hover Planet in nav → all Planets highlighted on map
- Click Planet on map → slide-in info panel from right
- Hover "Meta Stars" in nav → all Meta Stars highlighted
- Hover "Planets" in nav → all Planets highlighted

**Slide-in info panels (right side, ~340px wide):**
- **RA panel** (click RAi in nav): About RAi text, aggregate stats (total Meta Stars, Planets count)
- **Planets panel** (click Planets in nav): list of 7 planets with names, themes, descriptions
- **Planet detail panel** (click Planet on map): Planet name, description, associated Meta Stars list (empty if none yet)
- **Satellites panel** (click Satellites in nav): "Coming soon" message with brief description
- **Meta Stars panel** (click Meta Stars in nav): list/search of public Meta Stars + "Create your meta" CTA

**Dependencies**

- ISSUE-08 (map canvas)
- ISSUE-05 (auth, for burger menu)

**Acceptance Criteria**

- [ ] All nav items render and are clickable
- [ ] Burger menu opens with correct links
- [ ] Hover on "Planets" nav → Planets highlighted on map
- [ ] Hover on "Meta Stars" nav → Meta Stars highlighted (empty OK at this stage)
- [ ] Click Planet on map → Planet detail panel slides in
- [ ] All 5 panel types render with correct content
- [ ] Panels close on outside click or close button
- [ ] "Create your meta" CTA in Meta Stars panel links to `/create`

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] All panels verified manually
- [ ] Burger menu logout works
- [ ] Mobile nav works (burger menu accessible on small screen)

---

## ISSUE-10 — Meta Stars on Map

**Goal**

Render all public Meta Stars on the Explore map with correct visual representation, hover tooltips, and click behavior.

**Scope**

- `GET /api/v1/stars?public=true&limit=500` endpoint
- Redis cache for map data: TTL 60s
- Deterministic positions: `nameHash(star.name) → x/y coordinates` (from `packages/shared/utils/hash.ts`)
- Star rendering: colored glow points using `atmosphereParams.primaryColor` and `mapMarkerStyle`
- Star size: based on star type (Giant > Warm/Cold/Binary > Dim)
- Glow intensity: from `atmosphereParams.glowIntensity`
- Hover tooltip: name (`@name`), type badge, planet badges, bio preview (first 80 chars)
- Click on star → slide-in panel with full preview + "View Star →" link to `/star/:name`
- Own star: slightly larger + subtle ring indicator
- Planet hover → connected stars highlighted (matching `planetIds`)

**Dependencies**

- ISSUE-09 (map interactions and panels)
- ISSUE-03 (Star table, seed test stars)

**Acceptance Criteria**

- [ ] All public Meta Stars from DB render on map
- [ ] Star positions are deterministic (same name = same position every time)
- [ ] Star color matches `atmosphereParams.primaryColor` from DB
- [ ] Hover tooltip shows name, type, bio preview
- [ ] Click opens slide-in panel
- [ ] Own star has ring indicator (if logged in)
- [ ] Planet hover highlights connected stars
- [ ] Map renders under 3s with 300 stars

**Technical Notes**

- `nameHash` function must be in `packages/shared/utils/hash.ts` and used identically on frontend and backend
- Stars with `coreRoomConfig = null` use type-based default colors

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Deterministic positions verified (same seed → same positions across deploys)
- [ ] Redis cache confirmed working (second request returns cached)
- [ ] Performance with 300 stars < 3s render

---

## ISSUE-11 — Create Your Meta (3-step flow)

**Goal**

Build the complete 3-step Meta Star creation flow. After completion, the user has a registered Meta Star in Profile and (if public) on the map.

**Scope**

**Step 1 — Identity:**
- `POST /api/v1/stars` with full validation
- Star name: 3–30 chars, alphanumeric + hyphens, lowercase, no leading/trailing hyphens
- Real-time availability check (debounce 300ms)
- Reserved words validation
- Live address preview: `rai.app/@name`
- Display name field (pre-filled from account, editable)
- Bio field (max 160 chars, character counter)
- Planet association: pill selector for 1–2 planets (optional)

**Step 2 — Atmosphere:**
- Star type selector: Cold / Warm / Binary / Dim / Giant (with color preview)
- AI prompt textarea (placeholder: "Describe your space in 2–3 sentences")
- 20 starter prompt chips (no credit cost)
- "Generate" button → BullMQ job → SSE progress indicator
- Live preview panel: how the star will appear on the map (color, glow, marker style)
- Credit check before generation (402 if insufficient)
- Credit deduction after successful generation

**Step 3 — Visibility:**
- Public / Private toggle with explanation of each
- Full summary card: name, address, type, planets, atmosphere preview
- "Launch Your Star" CTA
- Post-launch: redirect to `/profile`

**Out of Scope**

- AI Generator as a standalone screen — that is ISSUE-13
- No room system

**Dependencies**

- ISSUE-05 (identity logic)
- ISSUE-03 (Star table)
- Partial ISSUE-13 depends on atmosphere generation worker (can stub for now)

**Acceptance Criteria**

- [ ] Complete 3-step flow navigable without errors
- [ ] Star name validation: taken → 409, reserved → 400, invalid chars → 400
- [ ] One star per user enforced (second attempt → blocked)
- [ ] AI generation: prompt → AtmosphereParams JSON → preview updates
- [ ] Starter prompts work without credit deduction
- [ ] Public star: appears on Explore map after creation
- [ ] Private star: does not appear on map
- [ ] Redirect to `/profile` after launch

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Full creation flow E2E tested on clean account
- [ ] Both public and private creation tested
- [ ] Credit flow verified (deduction after generation)

---

## ISSUE-12 — Profile Dashboard

**Goal**

Build the Profile screen — the ownership dashboard that gives users a sense of control over their Meta Star.

**Scope**

- `GET /api/v1/me/star` endpoint for profile data
- Layout: ownership dashboard feel
- Meta Star card: name, address, type badge, planet badges, atmosphere visual (static render of `atmosphereParams`)
- Metrics section: Total Visitors (all time), This Week visitors
- Plan badge: Free / Pro
- Credits section: current balance + "Top up →" link
- Quick actions:
  - "Edit Atmosphere" → opens AI Generator overlay (ISSUE-13)
  - "Edit Info" → inline edit for displayName, bio, planet associations
  - Toggle Public / Private with confirmation
  - "Share" → copy link + toast
- "Connect Wallet" label — visible as "Coming soon" text only, no functionality
- `PATCH /api/v1/me/star` endpoint for updates

**Out of Scope**

- AI Generator overlay — shell only here, full implementation in ISSUE-13

**Dependencies**

- ISSUE-11 (Star exists in DB)
- ISSUE-10 (visits tracking started)

**Acceptance Criteria**

- [ ] Profile renders all Meta Star data correctly
- [ ] Visitor metrics displayed
- [ ] Edit Info: displayName, bio, and planet associations can be updated
- [ ] Toggle Public/Private updates DB and map visibility
- [ ] Share: copies `rai.app/@name` to clipboard + toast
- [ ] "Connect Wallet" visible as Coming Soon only — no interactive element

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] All quick actions verified
- [ ] Edit Info saves to DB
- [ ] Public/Private toggle verified on map

---

## ISSUE-13 — AI Atmosphere Generator

**Goal**

Build the full AI atmosphere generation system — the creative engine of RAi.

**Scope**

- OpenAI GPT-4o structured output → `AtmosphereParams` JSON
- `buildAtmospherePrompt(userPrompt: string)` prompt builder in `apps/api/src/services/openai.ts`
- BullMQ queue `atmosphere-generation` + worker
- `POST /api/v1/stars/:id/generate` endpoint (authed, owner only)
- SSE endpoint: `GET /api/v1/generations/:jobId/status` → `{ status, progress, result? }`
- Credit check BEFORE enqueue → 402 if insufficient
- Credit deduction AFTER successful generation
- Rollback: `POST /api/v1/stars/:id/rollback` — restore from previous `AIGeneration` (max 3 back), costs 1 credit
- Rate limiting: max 10 generations/hour per user (Redis counter)
- 20 starter prompts: seeded in DB, available without credit cost
- Error handling: OpenAI timeout 30s → job fails → SSE returns error
- AI Generator UI overlay in Profile: prompt textarea, starter prompts, progress, live map preview, rollback control, credit display

**AtmosphereParams schema (structured output):**
```typescript
{
  primaryColor: string,      // hex
  secondaryColor: string,    // hex
  fogDensity: number,        // 0–1
  particleType: string,      // "stars"|"dust"|"fireflies"|"void"
  particleCount: number,     // 0–1000
  ambientMood: string,       // "calm"|"neutral"|"intense"
  glowIntensity: number,     // 0–1
  mapMarkerStyle: string     // "point"|"ring"|"pulse"|"cross"
}
```

**Dependencies**

- ISSUE-12 (Profile screen hosts the UI)
- ISSUE-03 (AIGeneration, CreditTransaction tables)

**Acceptance Criteria**

- [ ] Prompt → AtmosphereParams JSON generated within 5 seconds
- [ ] SSE stream delivers progress updates
- [ ] Map preview updates after generation
- [ ] User with 0 credits → 402 before job is enqueued
- [ ] Credit deduction only after successful generation
- [ ] Rollback to previous version: credits deducted, atmosphereParams updated
- [ ] 11th generation in an hour → 429
- [ ] Starter prompts: no credits deducted
- [ ] 15+ different prompts tested — all return valid AtmosphereParams JSON

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Credit check + deduction E2E verified
- [ ] BullMQ worker stable (no memory leaks in Railway logs)
- [ ] Rollback flow verified
- [ ] 15+ prompts tested

---

## ISSUE-14 — Public Star Preview + Share

**Goal**

Build the public page for any Meta Star and the full share mechanism.

**Scope**

- `/star/:name` route — public, no auth required
- `GET /api/v1/stars/:name/public` endpoint
- Page displays: name, address `rai.app/@name`, type badge, planet badges, bio, visitor count, atmosphere visual (static render)
- Atmosphere visual: beautiful static render of `atmosphereParams` (CSS gradient + particle overlay, NOT full 3D)
- OG image: `@vercel/og` at `/api/og?name=[name]` → 1200×630 — star name + atmosphere colors + type
- Twitter Card meta tags
- Share button: copies `rai.app/@name` to clipboard + toast
- "Enter Universe" CTA → redirect to `/explore` with this star highlighted
- Visitor tracking: `POST /api/v1/stars/:id/visit` (sessionId-based idempotency, Redis TTL 3600s)
- Throttled email notification to owner: Resend, max 1 email/60min per star (Redis TTL)
- In-app notification badge in Profile nav

**Out of Scope**

- Full 3D atmosphere rendering on this screen

**Dependencies**

- ISSUE-11 (Star data)
- ISSUE-09 (Explore map, for "Enter Universe" redirect)

**Acceptance Criteria**

- [ ] `/star/:name` renders correctly for a public star
- [ ] `/star/:name` returns 404 for non-existent or private star
- [ ] OG image accessible at `/api/og?name=[name]`
- [ ] Twitter Card Validator → green
- [ ] Share copies correct URL + shows toast
- [ ] "Enter Universe" redirects to `/explore`
- [ ] Visit recorded (idempotency: same session = 1 record)
- [ ] Owner email notification throttle works

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Twitter Card Validator — green
- [ ] OG image renders with correct colors
- [ ] Idempotency tested (multiple clicks = 1 DB record)
- [ ] Email throttle verified

---

## ISSUE-15 — Payments (Stripe)

**Goal**

Implement the complete payment system — credit packages and Pro subscription.

**Scope**

- Stripe SDK: `stripe` in `apps/api`, `@stripe/stripe-js` in `apps/web`
- Credit packages (Stripe Products in test mode):
  - Starter: 50 credits — $5
  - Growth: 200 credits — $15
  - Pro Pack: 500 credits — $30
- Stripe Checkout Session: `POST /api/v1/payments/checkout` → redirect URL
- Pro subscription: `POST /api/v1/payments/subscribe` → Stripe Billing with 7-day trial
- Webhook handler: `POST /api/webhooks/stripe` with signature verification
- Handled events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
- `CreditTransaction` record on every balance change
- `Subscription` record sync after webhook
- Stripe Customer Portal: `POST /api/v1/payments/portal`
- Credit balance in Profile: always current
- Upgrade modal when `insufficient_credits` or `upgrade_required`

**Out of Scope**

- Stripe live mode (test mode only until soft launch)
- Refund automation
- Affiliate/referral commission

**Dependencies**

- ISSUE-12 (Profile for credit display)
- ISSUE-04 (userId for Stripe customer)

**Acceptance Criteria**

- [ ] Test credit purchase → `checkout.session.completed` webhook → credits in DB
- [ ] Pro subscription → `Subscription` active → Pro features available
- [ ] Subscription cancel → downgraded to Free
- [ ] Webhook signature verification: wrong secret → 400
- [ ] Customer Portal: user can manage/cancel subscription
- [ ] Credit balance updates after purchase
- [ ] Upgrade modal appears when credits insufficient

**Technical Notes**

- Credit update: always in one Prisma transaction (`CreditTransaction` + `User.creditsBalance`)
- Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 9995` (decline)

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Webhook signature verified
- [ ] Credit update in single DB transaction
- [ ] Test purchase E2E clean
- [ ] Subscription cancel E2E clean

---

## ISSUE-16 — Analytics + Monitoring + QA + Production Readiness

**Goal**

Complete the full production readiness checklist and prepare for Soft Launch with 50 invited users.

**Scope**

**Analytics:**
- PostHog snippet in `apps/web` root layout
- `posthog.identify(userId, { email, planTier })` after login
- Key events: `star_created`, `generation_started`, `generation_completed`, `payment_completed`, `star_shared`, `star_visited`, `map_planet_clicked`

**Error tracking + logging:**
- Sentry `@sentry/nextjs` in `apps/web`, `@sentry/node` in `apps/api`
- Sentry `ErrorBoundary` in root layout
- Sentry global error handler in Fastify
- Sentry source maps uploaded on CD deploy
- Pino JSON logging for all API requests

**Uptime:**
- Checkly or Better Uptime monitoring `/api/health`, alert if down > 2 min

**Production config:**
- All production env vars set in Vercel and Railway
- CORS: `allowedOrigins: [production domain]` — not `*`
- Redis-based rate limiting confirmed (not in-memory)
- DB backup: Railway auto-backup daily
- Rollback plan documented in `docs/rollback-plan.md`

**Legal:**
- Privacy Policy at `/privacy`
- Terms of Service at `/terms`

**QA:**
- E2E flow 5 times on clean accounts: register → create star → generate atmosphere → see on map → share → visit as another user
- Mobile QA: iPhone Safari + Android Chrome full flow
- k6 load test: 50 concurrent users, 5 min, p95 < 800ms, 0 errors (`tests/load/k6-smoke.js`)
- 404 page for `/star/nonexistent`
- Error boundaries prevent full-page crashes
- Empty states for all lists
- Loading states for all async operations

**Dependencies**

- All ISSUE-00 → ISSUE-15 merged and working

**Acceptance Criteria**

- [ ] Sentry alert triggered by intentional error (both frontend and backend)
- [ ] PostHog shows `star_created` event after creation
- [ ] k6: 50 concurrent users, p95 < 800ms, 0 errors
- [ ] E2E flow 5 times on clean accounts — no errors
- [ ] Mobile QA: iPhone Safari + Android Chrome — no errors
- [ ] Privacy Policy and Terms accessible
- [ ] 404 page renders for non-existent star
- [ ] CORS rejects requests from `evil.com`

**Merge Checklist**

- [ ] `pnpm typecheck` ✅
- [ ] `pnpm lint` ✅
- [ ] Sentry alerts verified (frontend + backend)
- [ ] PostHog events verified
- [ ] k6 results attached to PR
- [ ] E2E 5× documented in PR
- [ ] Mobile QA on real devices verified
- [ ] Privacy Policy + ToS live on production

---

## Operating Contract
```
1. FOUNDER → CLAUDE: "Give me the prompt for ISSUE-XX"
2. CLAUDE → generates Cursor Agent Prompt
3. FOUNDER → Cursor Agent
4. Cursor → changes in repo
5. FOUNDER → CLAUDE: diff or summary
6. CLAUDE → review (Correctness → Architecture → Future Impact)
7. CLAUDE → verdict:
   ✅ READY TO MERGE
   ⚠️  NEEDS FIXES
   🚨 ARCHITECTURAL RISK
8. After READY TO MERGE → merge → CD deploy → verify production
9. Next issue
```

**Architectural Risk triggers** (merge blocked):
- Prisma schema change without new migration
- Business logic in `packages/shared`
- Any item from `docs/future-reference.md` implemented
- Circular dependency between apps
- Hardcoded credentials or secrets
- Deleted or edited applied migration
- "enter star," "enter planet," or "planet interior" in scope of a Cursor prompt
