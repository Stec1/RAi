# RAi — GitHub Issues Pack v3

> Complete set of GitHub issues for MVP2.
> Each issue is ready to copy into GitHub.
> Execution order: ISSUE-00 → ISSUE-20.
>
> Workflow: Claude generates Cursor prompt → Cursor executes →
> Founder brings diff → Claude reviews → merge or fixes.

---

## Issue Map

| ID | Title | Phase | Unlocks |
|---|---|---|---|
| ISSUE-00 | Documentation Rewrite | Foundation | Correct context for all agents |
| ISSUE-01 | Monorepo Scaffold | Foundation | Dev environment ready |
| ISSUE-02 | Infrastructure + CI/CD | Foundation | Auto-deploy active |
| ISSUE-03 | Database Schema + Seed | Foundation | Data contract set |
| ISSUE-04 | Authentication | Auth | Protected routes available |
| ISSUE-05 | Observatory Identity Logic | Auth | Identity separation clear |
| ISSUE-06 | Start Page | UI | First public screen |
| ISSUE-07 | About + Auth Screens | UI | Auth screens ready |
| ISSUE-08 | Map Foundation | Map | Intelligence topology renders |
| ISSUE-09 | Map Interactions | Map | Map fully interactive |
| ISSUE-10 | Observatories on Map | Map | Phase gate: "Does the map communicate intelligence network?" |
| ISSUE-11 | Create Observatory Flow | Creation | Observatories can be created |
| ISSUE-12 | Control Panel (Dashboard) | Owner | Owner management ready |
| ISSUE-13 | Systems Registration | Systems | AI systems can be registered |
| ISSUE-14 | Publication System | Content | Phase gate: "Does the publication flow deliver core value?" |
| ISSUE-15 | Observatory Public Page | Public | Phase gate: "Does Observatory page feel like premium research space?" |
| ISSUE-16 | Explore Feed + Discovery | Discovery | Content is discoverable |
| ISSUE-17 | Upvote + Reputation | Reputation | Community evaluation live |
| ISSUE-18 | AI Visual Signature Generator | Visual | Visual identity system live |
| ISSUE-19 | Payments (Stripe) | Payments | Monetization live |
| ISSUE-20 | Analytics + QA + Launch | Launch | Phase gate: "Ready for 50 invited users" |

---

---

## ISSUE-00 — Documentation Rewrite

**Goal**

Rewrite all documentation to align with the RAi v2 concept (observatory platform for AI systems) before any code is written.

**Scope**

- Archive old docs: `docs/planet-definitions.md`, `docs/github-issues-pack-v2.md`
- Create: `docs/vision.md`, `docs/domain-definitions.md`, `docs/github-issues-pack-v3.md`
- Rewrite: `docs/mvp-contract.md`, `docs/world-structure.md`, `docs/screens-spec.md`, `docs/visual-reference.md`, `docs/future-reference.md`, `ROADMAP.md`, `README.md`
- Update: `docs/architecture.md`, `docs/decision-log.md`, `docs/backlog.md`

**Out of Scope**

- No code. No configuration. No packages.
- Folder structure — in ISSUE-01.

**Dependencies**

- None

**Acceptance Criteria**

- [ ] `docs/vision.md` contains approved product definition
- [ ] `docs/world-structure.md` describes RA, Domains, Observatories (no Satellites)
- [ ] `docs/domain-definitions.md` contains all 7 Domains with names, themes, and seed positions
- [ ] `docs/mvp-contract.md` reflects MVP2 scope (observatory + publication + reputation)
- [ ] `docs/future-reference.md` locks post-MVP features correctly
- [ ] `docs/architecture.md` reflects new entity set (Domain, Observatory, System, Publication)
- [ ] `ROADMAP.md` reflects new phases and milestones
- [ ] No forbidden terminology in any doc (Meta Star, Planet as product object, Satellite, atmosphereParams)

**Merge Checklist**

- [ ] All 7 Domains defined in `docs/domain-definitions.md`
- [ ] `docs/mvp-contract.md` does not mention enterable worlds or metaverse
- [ ] Old docs archived in `docs/archive/`

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

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Structure matches `docs/architecture.md`
- [ ] `packages/shared` correctly referenced from both apps

---

## ISSUE-02 — Infrastructure + CI/CD

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

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Production health endpoint returns 200
- [ ] CI blocks PRs with TypeScript errors

---

## ISSUE-03 — Database Schema + Seed

**Goal**

Define the complete data architecture for MVP2 via Prisma schema, run migrations, and seed the 7 Domains.

**Scope**

- Railway: PostgreSQL provisioned, `DATABASE_URL` stored
- Redis (Upstash or Railway): `REDIS_URL` stored
- Prisma initialized in `apps/api`, connected to PostgreSQL
- Full schema with all tables:
  - `User` (id, email, name, planTier, creditsBalance, stripeCustomerId, createdAt)
  - `Observatory` (id, userId, name unique, displayName, type, publicMode, visualSignature JSONB, domainIds[], bio, socialLinks JSONB, reputationScore, publicationsCount, createdAt)
  - `Domain` (id, name, slug unique, description, theme, positionX, positionY, active)
  - `System` (id, observatoryId, name, type, description, capabilities[], status, externalUrl, createdAt)
  - `Publication` (id, observatoryId, systemId nullable, title, summary, keyFindings JSONB, methodology, body, rawContent, domainId, tags[], capabilitiesDemonstrated[], upvoteCount, status, publishedAt, createdAt)
  - `PublicationUpvote` (id, publicationId, userId, createdAt; unique: [publicationId, userId])
  - `AIGeneration` (id, userId, observatoryId, prompt, resultParams JSONB, creditsUsed, generationType, status, createdAt)
  - `CreditTransaction` (id, userId, amount, type, referenceId, createdAt)
  - `Subscription` (id, userId unique, stripeId, plan, status, periodEnd)
  - `ObservatoryVisit` (id, observatoryId, visitorUserId nullable, sessionId, visitedAt)
- First migration run in dev and production
- Seed script: all 7 Domains with data from `docs/domain-definitions.md`
- Seed script: 3 test users, 3 test Observatories
- Shared types in `packages/shared/src/types/`

**Out of Scope**

- No API routes on top of schema
- No Prisma middleware or soft deletes

**Dependencies**

- ISSUE-02

**Acceptance Criteria**

- [ ] `prisma migrate deploy` succeeds in production
- [ ] `prisma db seed` populates DB with all 7 Domains and test data
- [ ] Prisma Studio: all tables present, data readable/writable
- [ ] Shared types exported from `packages/shared`
- [ ] Domain seed data matches `docs/domain-definitions.md` exactly
- [ ] 3 active Domains flagged correctly, 4 marked inactive

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] All 10 tables in schema
- [ ] Migration ran in production
- [ ] All 7 Domains seeded with correct data
- [ ] Shared types exported correctly

---

## ISSUE-04 — Authentication

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

- [ ] Signup → email verification arrives via Resend
- [ ] Login with valid credentials → session cookie set
- [ ] `GET /api/me` without session → 401
- [ ] `GET /api/me` with valid session → user object
- [ ] Google OAuth: redirect → callback → session → user in DB
- [ ] 6th auth attempt per minute → 429
- [ ] Password reset: email → link → new password → login

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Email verification works
- [ ] Google OAuth E2E works
- [ ] Rate limiting verified
- [ ] Protected middleware blocks without session

---

## ISSUE-05 — Observatory Identity Logic

**Goal**

Establish the clear separation between user account identity and Observatory identity. A user can exist without an Observatory. An Observatory name is permanent and separate from the account display name.

**Scope**

- After registration: user has `displayName` (derived from email prefix, editable)
- Observatory `name` = separate permanent identifier, chosen in creation flow
- `GET /api/v1/observatories/check/:name` — availability check endpoint
- Reserved words list: `admin, api, www, rai, app, help, support, login, signup, me, explore, settings, dashboard, create, about, static, assets, public, private, observatory, publication`
- User without Observatory → redirected to `/create` after login
- User with Observatory → redirected to `/dashboard` after login
- Auth flow checks `user.observatoryId` (nullable) to determine redirect

**Out of Scope**

- Observatory creation itself — in ISSUE-11
- Control Panel UI — in ISSUE-12

**Dependencies**

- ISSUE-04

**Acceptance Criteria**

- [ ] New user after signup has no Observatory (`observatoryId = null`)
- [ ] After login without Observatory → redirect to `/create`
- [ ] After login with Observatory → redirect to `/dashboard`
- [ ] `GET /api/v1/observatories/check/testname` → `{ available: true/false }`
- [ ] Reserved word check → `{ available: false, reason: "reserved" }`

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Redirect logic verified for both cases
- [ ] Availability check works for taken, available, and reserved names

---

## ISSUE-06 — Start Page

**Goal**

Build the public landing page that communicates what RAi is within seconds and drives users toward registration.

**Scope**

- Full-screen premium dark editorial landing page
- Top bar: RAi logo (clickable → `/about`), "Log in" → `/login`, "Get Started" → `/signup`
- Scrollable narrative sections:
  - What is RAi
  - How it works (publish → prove → get discovered)
  - Domain showcase (active Domains)
  - CTA to create Observatory
- Footer: links to About, Privacy Policy, Terms
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
- [ ] Page is readable on mobile (iPhone Safari)
- [ ] No console errors
- [ ] Visual direction matches `docs/visual-reference.md`

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] All nav links work
- [ ] Mobile layout verified

---

## ISSUE-07 — About + Auth Screens

**Goal**

Build the About screen and the auth screens (Login and Get Started).

**Scope**

**About (`/about`):**
- Full readable description of the RAi platform
- Covers: what RAi is, Domains, Observatories, publications, reputation
- Clean typographic layout
- Back/home navigation

**Login (`/login`):**
- Premium dark editorial card layout
- Email + password fields
- "Log in" button
- Google OAuth button
- Link to `/signup`
- Error states for invalid credentials

**Get Started (`/signup`):**
- Same card layout as Login
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
- [ ] Error states display correctly
- [ ] Both auth screens work on mobile

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Login E2E works
- [ ] Signup E2E works
- [ ] Google OAuth E2E works

---

## ISSUE-08 — Map Foundation

**Goal**

Build the base intelligence topology visualization with RA at center and all 7 Domains at their seed positions. Navigation (pan, zoom) working.

**Scope**

- Map component: abstract network visualization (data-driven, not decorative space)
- RA rendered at (0, 0): central node, platform identity
- 7 Domains rendered at positions from seed data: cluster nodes with theme colors
- Active Domains (3) visually distinct from Coming Soon Domains (4)
- Pan: click-drag with inertial momentum
- Zoom: scroll wheel + pinch, min/max limits
- Mini-map in bottom-right corner
- Responsive canvas
- `GET /api/v1/domains` endpoint: returns all 7 Domains with positions and active status
- Mobile: simplified rendering, touch support

**Out of Scope**

- Observatories on map — in ISSUE-10
- Nav interactions — in ISSUE-09
- No user data on map yet

**Dependencies**

- ISSUE-03 (Domains in DB)

**Acceptance Criteria**

- [ ] Map renders at `/explore` with RA and 7 Domains
- [ ] Domain positions match seed data from `docs/domain-definitions.md`
- [ ] Active vs Coming Soon Domains visually distinguishable
- [ ] Pan and zoom work on desktop and mobile
- [ ] Mini-map shows current viewport position
- [ ] Map renders without errors on iPhone Safari

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Performance acceptable on mobile
- [ ] Domain positions match seed data exactly

---

## ISSUE-09 — Map Interactions

**Goal**

Add the full navigation layer to the Explore screen: top nav bar, hover/click interactions on map objects, and slide-in info panels.

**Scope**

**Top navigation bar:**
- Transparent bar floating over map
- Items: RAi (logo) / Domains / Observatories / Burger menu
- Burger menu: Dashboard → `/dashboard`, Settings → `/dashboard/settings`, Log out

**Map object interactions:**
- Hover Domain → tooltip (name, theme, Observatory count)
- Click Domain on map → slide-in info panel from right
- Hover "Observatories" in nav → all Observatories highlighted

**Slide-in info panels (~340px wide):**
- **RA panel** (click RAi in nav): About RAi text, platform stats
- **Domains panel** (click Domains in nav): list of active Domains with names, themes, counts
- **Domain detail panel** (click Domain on map): Domain name, description, associated Observatories list
- **Observatories panel** (click Observatories in nav): ranked list + "Create Observatory" CTA

**Dependencies**

- ISSUE-08 (map canvas)
- ISSUE-05 (auth, for burger menu)

**Acceptance Criteria**

- [ ] All nav items render and are clickable
- [ ] Burger menu opens with correct links
- [ ] Click Domain on map → Domain detail panel slides in
- [ ] All panel types render with correct content
- [ ] Panels close on outside click or close button
- [ ] "Create Observatory" CTA in Observatories panel links to `/create`

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] All panels verified manually
- [ ] Mobile nav works

---

## ISSUE-10 — Observatories on Map

**Goal**

Render all public Observatories on the intelligence topology with correct visual representation, hover tooltips, and click behavior.

**Scope**

- `GET /api/v1/observatories?public=true&limit=500` endpoint
- Redis cache for map data: TTL 60s
- Deterministic positions: `nameHash(observatory.name) → x/y coordinates`
- Observatory rendering: nodes with Domain color association
- Node size: based on reputation score
- Hover tooltip: name (`@name`), type badge, Domain badges, publication count
- Click on Observatory → slide-in panel with preview + "View Observatory →" link to `/observatory/:name`
- Own Observatory: highlighted with distinct indicator
- Domain hover → connected Observatories highlighted

**Dependencies**

- ISSUE-09 (map interactions and panels)
- ISSUE-03 (Observatory table, seed test Observatories)

**Acceptance Criteria**

- [ ] All public Observatories from DB render on map
- [ ] Observatory positions are deterministic (same name = same position)
- [ ] Hover tooltip shows name, type, publication count
- [ ] Click opens slide-in panel
- [ ] Own Observatory has distinct indicator (if logged in)
- [ ] Domain hover highlights connected Observatories
- [ ] Map renders under 3s with 300 Observatories

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Deterministic positions verified
- [ ] Redis cache confirmed working
- [ ] Performance with 300 Observatories < 3s render

---

## ISSUE-11 — Create Observatory Flow

**Goal**

Build the 3-step Observatory creation flow. After completion, the user has a registered Observatory.

**Scope**

**Step 1 — Identity:**
- Observatory name: 3–30 chars, alphanumeric + hyphens, lowercase
- Real-time availability check (debounce 300ms)
- Reserved words validation
- Live address preview: `rai.app/@name`
- Display name (pre-filled from account, editable)
- Bio (max 160 chars, character counter)
- Domain association: pill selector for 1–2 active Domains (optional)
- Social links (GitHub, X, Telegram, LinkedIn, email, website)
- Observatory type: individual / studio / product

**Step 2 — First Publication:**
- "Paste your agent's latest output. RAi will format it."
- Raw content textarea
- System selection (optional — can skip, no systems registered yet)
- RAi AI formats content: title, summary, key findings, body
- Creator reviews and edits
- Domain and tags selection
- Publish (1 credit) or save as draft

**Step 3 — Visual Signature (optional):**
- "Make your Observatory visually unique."
- AI prompt textarea
- Generate button → Visual Signature preview
- Can be skipped — default Visual Signature assigned based on Domain
- Post-creation redirect: `/dashboard`

**Out of Scope**

- Visual Signature generator as standalone feature — that is ISSUE-18

**Dependencies**

- ISSUE-05 (identity logic)
- ISSUE-03 (Observatory, Publication tables)

**Acceptance Criteria**

- [ ] Complete 3-step flow navigable without errors
- [ ] Observatory name validation: taken → 409, reserved → 400, invalid chars → 400
- [ ] One Observatory per user enforced
- [ ] First Publication formatted by AI and publishable
- [ ] Step 3 skippable — default Visual Signature assigned
- [ ] Redirect to `/dashboard` after creation

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Full creation flow E2E tested on clean account
- [ ] Publication formatting verified

---

## ISSUE-12 — Control Panel (Dashboard)

**Goal**

Build the Control Panel — the owner's management interface for their Observatory.

**Scope**

- `GET /api/v1/me/observatory` endpoint for dashboard data
- Dashboard layout at `/dashboard`
- Observatory stats: visitors, publication views, total upvotes
- Quick actions: Edit Identity, Manage Systems, New Publication, Visual Signature, Settings
- Observatory card: name, address, type badge, Domain badges, reputation score
- Plan badge: Free / Pro
- Credits section: current balance + "Top up →" link
- `PATCH /api/v1/me/observatory` endpoint for updates

**Out of Scope**

- Systems management UI — in ISSUE-13
- Publication management UI — in ISSUE-14
- Visual Signature generator UI — in ISSUE-18

**Dependencies**

- ISSUE-11 (Observatory exists in DB)

**Acceptance Criteria**

- [ ] Dashboard renders all Observatory data correctly
- [ ] Stats displayed (visitors, views, upvotes)
- [ ] Quick action links navigate to correct sub-routes
- [ ] Edit Identity: displayName, bio, social links, Domain can be updated
- [ ] Credits balance displayed

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] All quick actions verified
- [ ] Edit Identity saves to DB

---

## ISSUE-13 — Systems Registration

**Goal**

Build the systems registration and management feature for Observatory owners.

**Scope**

- `POST /api/v1/me/systems` — create system
- `GET /api/v1/me/systems` — list owner's systems
- `PATCH /api/v1/me/systems/:id` — update system
- `DELETE /api/v1/me/systems/:id` — delete system
- Dashboard sub-route: `/dashboard/systems`
- System form: name, type (agent/workflow/tool/service), description, capabilities tags, status (active/demo/concept), external URL
- System cards displayed as structured proof cards
- Text-only in MVP2 — no media attachments

**Out of Scope**

- Media attachments (images, video, 3D)
- Agent execution or demo proxy

**Dependencies**

- ISSUE-12 (Control Panel)

**Acceptance Criteria**

- [ ] CRUD for systems works end-to-end
- [ ] System appears on Observatory public page after creation
- [ ] Capabilities displayed as refined pills
- [ ] Status dot renders correctly (active: green, demo: amber, concept: muted)
- [ ] External URL links out correctly

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] CRUD verified
- [ ] System card rendering verified on public page

---

## ISSUE-14 — Publication System

**Goal**

Build the full publication creation, formatting, and management system — the core content engine of RAi.

**Scope**

- OpenAI GPT-4o structured output for publication formatting
- `POST /api/v1/me/publications` — create/format publication
- `GET /api/v1/me/publications` — list owner's publications
- `PATCH /api/v1/me/publications/:id` — update publication
- Dashboard sub-route: `/dashboard/publications` (list) and `/dashboard/publish` (create new)
- Publication creation flow:
  1. Select System (optional)
  2. Paste/write raw content
  3. RAi AI formats: title suggestion, summary, key findings, formatted body
  4. Creator reviews and edits any field
  5. Select Domain and tags
  6. Publish (1 credit) or save as draft
- BullMQ queue for AI formatting + SSE progress
- Credit check before formatting → 402 if insufficient
- Credit deduction after successful formatting
- Rate limiting: 20 publications/hour per user
- Publication standalone page: `/publication/:id`

**Out of Scope**

- Upvotes — in ISSUE-17
- Comments — not in MVP2
- Media attachments — not in MVP2

**Dependencies**

- ISSUE-12 (Control Panel hosts the UI)
- ISSUE-03 (Publication, AIGeneration tables)

**Acceptance Criteria**

- [ ] Raw content → AI-formatted publication within 10 seconds
- [ ] Creator can edit all fields before publishing
- [ ] Published publication appears on Observatory page and in feed
- [ ] Draft publications only visible to owner
- [ ] Credit check and deduction work correctly
- [ ] Publication standalone page renders with full formatting
- [ ] OG image generated for social sharing

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Publication formatting E2E verified
- [ ] Credit flow verified
- [ ] 10+ different raw contents tested — all produce valid formatted output

---

## ISSUE-15 — Observatory Public Page

**Goal**

Build the public Observatory page — the premium research identity that visitors see.

**Scope**

- `/observatory/:name` route — public, no auth required
- `GET /api/v1/observatories/:name/public` endpoint
- Page layout (single vertical scroll):
  - Hero zone: Visual Signature ambient field, name (large typography), reputation metrics, social links
  - Systems section: structured proof cards on elevated surface
  - Publications section: vertical stack of publication cards (title, date, system, summary, upvotes)
  - Footer: social links, contact CTA
- OG image: `@vercel/og` at `/api/og?name=[name]` → 1200x630
- Twitter Card meta tags
- Visitor tracking: `POST /api/v1/observatories/:id/visit`
- Share button: copy link + toast

**Out of Scope**

- Full 3D or complex visual rendering
- Comments or messaging

**Dependencies**

- ISSUE-13 (Systems data)
- ISSUE-14 (Publications data)

**Acceptance Criteria**

- [ ] `/observatory/:name` renders correctly for public Observatory
- [ ] `/observatory/:name` returns 404 for non-existent or private Observatory
- [ ] Systems displayed as proof cards
- [ ] Publications displayed as card stack
- [ ] OG image accessible and renders correctly
- [ ] Visitor tracking works
- [ ] Share copies correct URL + shows toast

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Twitter Card Validator — green
- [ ] OG image renders correctly
- [ ] Mobile layout verified

---

## ISSUE-16 — Explore Feed + Discovery

**Goal**

Build the Explore feed and discovery features so publications and Observatories are discoverable.

**Scope**

- `/explore` route enhancements (beyond map view from ISSUE-08–10):
  - **Feed view (default):** vertical stream of publications, filterable by active Domain
  - **Observatories view:** ranked list with reputation, Domain filter
  - **Map view:** intelligence topology (existing from ISSUE-08–10)
- View switcher: Feed / Observatories / Map
- Sort toggles: trending (upvotes/time), newest, top (total upvotes)
- Domain filter pills (active Domains only)
- Full-text search across Observatory names, bios, systems, publication titles
- `GET /api/v1/publications?domain=&sort=&page=` — paginated feed
- `GET /api/v1/observatories?domain=&sort=&page=` — ranked list
- `GET /api/v1/search?q=` — full-text search

**Out of Scope**

- AI-assisted matching — not in MVP2
- Personalized recommendations — not in MVP2

**Dependencies**

- ISSUE-14 (Publications exist)
- ISSUE-15 (Observatory pages exist)

**Acceptance Criteria**

- [ ] Feed view shows publications sorted by trending/newest/top
- [ ] Domain filter works correctly
- [ ] Observatories view shows ranked list
- [ ] Search returns relevant results across all content types
- [ ] Pagination works (infinite scroll or page numbers)
- [ ] View switching between Feed / Observatories / Map is seamless

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] All three views verified
- [ ] Search returns correct results
- [ ] Mobile layout verified

---

## ISSUE-17 — Upvote + Reputation

**Goal**

Implement the upvote system and reputation scoring.

**Scope**

- `POST /api/v1/publications/:id/upvote` — toggle upvote (authed)
- `DELETE /api/v1/publications/:id/upvote` — remove upvote
- One upvote per user per publication enforced (DB unique constraint)
- Upvote count displayed on publication cards and standalone page
- Upvote button with micro-animation (200–300ms, ease-out)
- Reputation score calculation:
  - Complete Observatory profile: +10
  - Register System: +5
  - Publish research: +5
  - Publication gets 10+ upvotes: +10
  - Publication gets 50+ upvotes: +25
  - Consistent publishing (4+ per month): +15 streak bonus
- Reputation displayed on Observatory page and in Explore rankings
- Reputation influences sort order in Observatories view
- Background job: recalculate reputation scores (BullMQ, hourly)

**Out of Scope**

- Comments — not in MVP2
- Downvotes — not planned

**Dependencies**

- ISSUE-14 (Publications exist)
- ISSUE-15 (Observatory page displays reputation)

**Acceptance Criteria**

- [ ] Upvote toggles on/off correctly
- [ ] One upvote per user per publication enforced
- [ ] Upvote count updates in real time on the page
- [ ] Reputation score calculated and displayed on Observatory page
- [ ] Reputation influences Observatories ranking in Explore
- [ ] Upvote micro-animation works

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Upvote toggle verified
- [ ] Reputation calculation verified with test data

---

## ISSUE-18 — AI Visual Signature Generator

**Goal**

Build the AI-powered Visual Signature generation system — the visual identity engine.

**Scope**

- OpenAI GPT-4o structured output → Visual Signature JSON
- `POST /api/v1/me/observatory/visual-signature` endpoint (authed, owner only)
- BullMQ queue + worker for generation
- SSE progress endpoint
- Visual Signature parameters define: colors, gradients, ambient effects for Observatory page hero and map node
- Credit check before generation → 402 if insufficient
- Credit deduction after successful generation (2 credits)
- Rollback: restore from previous generation (max 3 back), costs 1 credit
- Rate limiting: 10 generations/hour per user
- Dashboard sub-route: `/dashboard/visual` — prompt textarea, generate button, preview, rollback
- Default Visual Signature assigned on Observatory creation (no credit cost)

**Out of Scope**

- 3D generation
- Full rendering engine

**Dependencies**

- ISSUE-12 (Control Panel hosts the UI)
- ISSUE-03 (AIGeneration table)

**Acceptance Criteria**

- [ ] Prompt → Visual Signature JSON generated within 5 seconds
- [ ] SSE stream delivers progress updates
- [ ] Observatory page hero updates after generation
- [ ] Map node visual updates after generation
- [ ] User with 0 credits → 402 before job is enqueued
- [ ] Credit deduction only after successful generation
- [ ] Rollback works correctly
- [ ] 15+ different prompts tested — all return valid Visual Signature JSON

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Credit check + deduction E2E verified
- [ ] BullMQ worker stable
- [ ] Rollback flow verified

---

## ISSUE-19 — Payments (Stripe)

**Goal**

Implement the complete payment system — credit packages and Pro subscription.

**Scope**

- Stripe SDK: `stripe` in `apps/api`, `@stripe/stripe-js` in `apps/web`
- Credit packages (Stripe Products in test mode):
  - Starter: 50 credits — $5
  - Growth: 200 credits — $15
  - Pro Pack: 500 credits — $30
- Pro subscription: $19/month
- Free tier limits: 5 publications/month, 3 systems, basic analytics, 10 starting credits
- Stripe Checkout Session: `POST /api/v1/payments/checkout` → redirect URL
- Pro subscription: `POST /api/v1/payments/subscribe` → Stripe Billing
- Webhook handler: `POST /api/webhooks/stripe` with signature verification
- Handled events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
- `CreditTransaction` record on every balance change
- `Subscription` record sync after webhook
- Stripe Customer Portal: `POST /api/v1/payments/portal`
- Upgrade modal when `insufficient_credits` or `upgrade_required`

**Out of Scope**

- Stripe live mode (test mode only until soft launch)
- Refund automation

**Dependencies**

- ISSUE-12 (Control Panel for credit display)
- ISSUE-04 (userId for Stripe customer)

**Acceptance Criteria**

- [ ] Test credit purchase → webhook → credits in DB
- [ ] Pro subscription → `Subscription` active → Pro features available
- [ ] Subscription cancel → downgraded to Free
- [ ] Webhook signature verification: wrong secret → 400
- [ ] Customer Portal: user can manage/cancel subscription
- [ ] Free tier limits enforced (5 publications/month, 3 systems)

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Webhook signature verified
- [ ] Credit update in single DB transaction
- [ ] Test purchase E2E clean

---

## ISSUE-20 — Analytics + QA + Launch

**Goal**

Complete the full production readiness checklist and prepare for Soft Launch with 50 invited users.

**Scope**

**Analytics:**
- PostHog in `apps/web` root layout
- `posthog.identify(userId, { email, planTier })` after login
- Key events: `observatory_created`, `system_registered`, `publication_published`, `publication_upvoted`, `payment_completed`, `observatory_visited`

**Error tracking + logging:**
- Sentry in `apps/web` and `apps/api`
- Sentry `ErrorBoundary` in root layout
- Pino JSON logging for all API requests

**Production config:**
- All production env vars set in Vercel and Railway
- CORS: `allowedOrigins: [production domain]`
- Redis-based rate limiting confirmed
- DB backup: Railway auto-backup daily

**Legal:**
- Privacy Policy at `/privacy`
- Terms of Service at `/terms`

**QA:**
- E2E flow 5 times on clean accounts: register → create Observatory → register system → publish → upvote → discover
- Mobile QA: iPhone Safari + Android Chrome full flow
- k6 load test: 50 concurrent users, 5 min, p95 < 800ms, 0 errors
- 404 page for non-existent routes
- Error boundaries prevent full-page crashes
- Empty states for all lists
- Loading states for all async operations

**Dependencies**

- All ISSUE-00 → ISSUE-19 merged and working

**Acceptance Criteria**

- [ ] Sentry alert triggered by intentional error (frontend + backend)
- [ ] PostHog shows `publication_published` event after publishing
- [ ] k6: 50 concurrent users, p95 < 800ms, 0 errors
- [ ] E2E flow 5 times on clean accounts — no errors
- [ ] Mobile QA: iPhone Safari + Android Chrome — no errors
- [ ] Privacy Policy and Terms accessible
- [ ] 404 page renders for non-existent routes
- [ ] CORS rejects requests from unauthorized origins

**Merge Checklist**

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Sentry alerts verified
- [ ] PostHog events verified
- [ ] k6 results attached to PR
- [ ] E2E 5x documented in PR
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
- Old terminology in code (Star, Planet, Satellite, atmosphereParams)

**Phase gates:**
- After ISSUE-10: Does the map communicate "intelligence network"?
- After ISSUE-14: Does the publication flow deliver core value?
- After ISSUE-15: Does Observatory page feel like premium research space?
- After ISSUE-20: Ready for 50 invited users.
