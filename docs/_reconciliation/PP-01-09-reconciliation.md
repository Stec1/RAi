# RAi — Post-Pivot Documentation Reconciliation (PP-01 … PP-09)

> **Task:** DOC-SYNC-01. **Branch:** `doc-sync-01-post-pivot`. **Scope:** docs only.
> **Source of truth:** the CODE at HEAD (`patch-pivot-09-sphere`, commit `1a9b3c1`).
> Where docs and code disagreed, the code won and the docs were corrected.
>
> This file is the durable analysis artifact behind the DOC-SYNC-01 reconciliation.
> It records what the docs *said* versus what the product *now does*, the exact
> supersession chains, and the residual open questions. It also feeds the Codex
> vault-sync prompt (`CODEX-vault-sync-prompt.md`) in this directory.

---

## 0. How this was derived

- Read every `docs/*.md`, `README.md`, `ROADMAP.md`.
- Read the code as the source of truth: `apps/web/src/app/**` (routes), `apps/api/src/**`
  (route registration + handlers), `apps/api/prisma/schema.prisma`, `apps/api/prisma/seed.ts`,
  and the Explore/Studio/Dashboard components referenced below.
- Read the full decision log (DL-01 … DL-50).
- Reconstructed the pivot timeline from `git log --oneline` merge commits (real PR numbers).

No PR numbers are fabricated. PP-09 is committed (`1a9b3c1`) but not yet merged at the time
of writing, so it has no PR number.

---

## 1. Timeline — before → after, per pivot

Each pivot is a merged (or, for PP-09, committed) "patch-pivot" branch. PR numbers are the
GitHub merge-commit numbers from `git log`.

### PP-01 — The Living Terminal (PR #30, DL-31…DL-34)
- **Before:** RAi = "premium observatory platform where AI systems publish research, prove
  capability, build reputation." `/` was a scroll-narrative marketing landing; dark-mode only.
- **After:** Concept pivot — RAi becomes **a universe of observatories** (art-stories about real
  places and virtual worlds). `/` and `/explore` both render the one-page **RAI Terminal** hosting
  a living universe. **Dual theme** (dark + light "paper") introduced. Two mock observatories with
  full-screen art-story overlays. World Mode deferred (DL-34).
- **Docs affected:** `concept-pivot.md` (created), `decision-log.md` (+DL-31…34), PIVOT NOTE banners
  added to `screens-spec.md` / `visual-reference.md`. Made `README`/`ROADMAP`/`vision`/`mvp-contract`
  conceptually stale (not yet updated → this task).

### PP-02 — Explore as a Living Terminal (PR #31, DL-35…DL-37, DL-33 amended)
- **Before:** Explore imagined as a full-bleed canvas; DL-30 said "no Observatory nodes on `/explore`".
- **After:** Explore becomes an **information terminal**: Registry rail + framed Topology panel +
  docked Inspector + Activity strip. **Observatories become first-class nodes** (DL-35, superseding the
  DL-30 omission clause). The PP-01 background **starfield is removed** (DL-33 amended) in favor of a
  living-instrument motion vocabulary (DL-37).
- **Docs affected:** `decision-log.md` (+DL-35/36/37, amended DL-33), `visual-reference.md` (inline
  supersession notes for topology/motion).

### PP-03 — The Living Crystal Graph (PR #32, DL-38…DL-40, DL-33/DL-37 amended)
- **Before:** flat, sparse SVG instrument.
- **After:** the **Living Crystal Graph** — luminous faceted gold RA hub, glowing identity orbs, curved
  gradient edges, elliptical depth rings, slow drift; real pill view-controls. Still **SVG+CSS** at this
  point (DL-38 explicitly keeps a 3D engine deferred). Recorded (not built): virtual/real lifecycle +
  `world` field (DL-39), idea-to-reality funding direction (DL-40).
- **Docs affected:** `decision-log.md` (+DL-38/39/40, amended DL-33/DL-37), `visual-reference.md`.

### PP-04 — The Observatory Studio (PR #33, DL-41/DL-42)
- **Before:** `/create` was a placeholder; the API was frozen; the old 3-step flow was
  "Identity → First Publication → Visual Signature".
- **After:** `/create` = the **Observatory Studio** — a multi-step environment
  **World → Identity → Board → Signature → Finish** with a persistent live preview. First
  **`POST /api/v1/observatories`** endpoint persists **base fields only** (no schema change; board,
  photos, and `world` stay local). First **glass primitives** (`GlassCard/GlassPanel/GlassButton/PageShell`)
  land as the DL-29 rollout surface. Visual signature is chosen manually (no AI generation).
- **Docs affected:** `decision-log.md` (+DL-41/42), `architecture.md` (should note the endpoint +
  glass primitives — **was not fully updated → this task**), `screens-spec.md` (PP-04 note added).

### PP-05 — The 3D Intelligence Graph (PR #34, DL-43…DL-45)
- **Before:** Explore topology was SVG+CSS (DL-38).
- **After:** Explore topology becomes a **real WebGL 3D graph** — `react-force-graph-3d` (pinned
  `1.29.1`) on the pre-existing `three`, lazy `next/dynamic` `ssr:false`, UnrealBloom post-processing,
  WebGL fallback. **All 7 domains are full nodes** (`active` is a visual state, DL-44). **Observatories
  inherit their parent-domain color** (DL-45). This **supersedes DL-38 / DL-37-SVG / DL-30 Level-1 /
  DL-10** for the Explore renderer. The SVG topology + its pan/zoom internals are deleted.
- **Docs affected:** `decision-log.md` (+DL-43/44/45), `architecture.md` + `visual-reference.md`
  (topology stack — **partially annotated, not fully updated → this task**).

### PP-06 — Graph Polish + Real Observatories + Dashboard (PR #35, DL-46/DL-47)
- **Before:** the graph showed only the two mocks; owners had no post-create surface.
- **After:** **`GET /api/v1/observatories`** public list feeds the graph; the two mocks become
  **demo-seed** (real replaces same-named mock; mocks are the fallback so the universe is never empty).
  Graph polish: reduced glow, RA vibration, (then-present) billboard labels. **`/dashboard`** becomes the
  owner's real screen backed by **`GET`/`PATCH /api/v1/me/observatory`** (`name` immutable). No schema change.
- **Docs affected:** `decision-log.md` (+DL-46/47), `architecture.md` (endpoints), `screens-spec.md`
  (Dashboard PP-06 note added).

### PP-07 — Graph Fix (PR #36, DL-48)
- **Before:** PP-06 used a "deep neutral scene in both themes" and persistent in-scene node labels;
  the UI implied virtual vs real worlds via kind tags.
- **After:** **Single-world UI** — the virtual/real distinction is **hidden** (world/kind tags removed
  from Registry, Inspector, overlay; mocks neutralized). The `world` field + `ObservatoryKind` values are
  **retained in data/types/studio draft** as forward flags. **Scene background follows the theme literally**
  (amends DL-43/PP-06-A1). **Persistent in-scene node labels removed** — identity lives in Inspector/Registry.
- **Docs affected:** `decision-log.md` (+DL-48). Made `screens-spec.md`/`visual-reference.md` virtual/real
  and labeling passages stale (**→ this task**).

### PP-08 — Observatory Story (PR #37, DL-49)
- **Before:** the art-story overlay and studio preview each rendered board blocks their own way
  (risk of divergence); flat, equal-weight block list.
- **After:** one shared renderer **`components/observatory/ObservatoryStory`** presents a board as a
  **directed art-story** (signature-driven hero, per-type block "moods", scroll-reveal). **Both** the
  Explore overlay and the `/create` live preview render through it. Additive-only optional block hints
  (`variant?`, `fullBleed?`); the builder, draft model/key, API/storage, and block data model are unchanged.
- **Docs affected:** `decision-log.md` (+DL-49).

### PP-09 — The Sphere (committed `1a9b3c1`, not yet merged, DL-50)
- **Before:** PP-05 force-directed layout; PP-07 theme-literal dark background (which still read as
  faint lilac under bloom).
- **After:** the topology is a **bounded spherical universe** — RA at origin, 7 domains on a middle shell
  (`R_DOMAIN=150`) via Fibonacci golden-spiral, observatories on an outer shell (`R_SHELL=300`) placed by a
  deterministic name-hash inside a cone biased to the parent domain (the scaling fix). Visible lat/long
  **sphere shell** boundary. **Deterministic pinned positions**, frozen physics (`cooldownTicks`/`warmupTicks=0`).
  **OrbitControls** with a clamped inside-the-sphere dolly. **Dark background is now true black `#000000`**
  (supersedes the PP-07 theme-literal dark choice); light keeps the paper token and updates live on theme flip.
- **Docs affected:** `decision-log.md` (+DL-50). Supersedes the DL-43 force-layout description and the
  DL-48 dark-background description (annotated in this task).

---

## 2. Current-state snapshot (verified from code, HEAD = `1a9b3c1`)

### 2.1 Web routes — real (`apps/web/src/app`)
| Route | File | Reality |
|---|---|---|
| `/` | `page.tsx` | Renders `<RaiTerminal/>` (the terminal). Scroll-narrative landing retired; its copy moved to `/about`. |
| `/explore` | `explore/page.tsx` | Renders the **same** `<RaiTerminal/>` (kept so redirects/links work). |
| `/about` | `about/page.tsx` | Readable platform narrative. |
| `/create` | `create/page.tsx` | The **Observatory Studio** (World→Identity→Board→Signature→Finish). |
| `/dashboard` | `dashboard/page.tsx` | Owner dashboard (auth-gated; no-observatory → `/create`). |
| `/login`, `/signup` | `login/`, `signup/` | Auth screens (flat routes — **no** `(auth)` group). |
| `/privacy`, `/terms` | `privacy/`, `terms/` | Legal pages. |

**Do NOT exist** (documented as if they did): `/observatory/[name]`, `/publication/[id]`,
`/dashboard/systems`, `/dashboard/publications`, `/dashboard/publish`, `/dashboard/visual`,
`/dashboard/settings`, `/api/og`, and the `(auth)` route group.

### 2.2 API endpoints — real (`apps/api/src`)
Five route files registered in `index.ts`: `health`, `auth`, `me`, `observatories` (prefix
`/api/v1/observatories`), `domains` (prefix `/api/v1/domains`).

| Method + path | File | Auth | Notes |
|---|---|---|---|
| `GET /api/health` | `health.ts` | no | `{ status, timestamp }` |
| `GET\|POST /api/auth/*` | `auth.ts` | — | Better Auth handler (email sign-up/in, sign-out, get-session) |
| `GET /api/me` | `me.ts` | yes | account summary; `observatory {id,name} \| null` |
| `GET /api/v1/me/observatory` | `me.ts` | yes | caller's full observatory (base fields) or 404 |
| `PATCH /api/v1/me/observatory` | `me.ts` | yes | update base fields; **`name` immutable**; no schema change |
| `GET /api/v1/observatories/check/:name` | `observatories.ts` | no | name availability |
| `GET /api/v1/observatories` | `observatories.ts` | no | public list, `publicMode:true`, base fields, limit 500 |
| `POST /api/v1/observatories` | `observatories.ts` | yes | create; base fields only; one-per-user; no schema change |
| `GET /api/v1/domains` | `domains.ts` | no | all 7 seeded domains |

**Do NOT exist** (documented in `architecture.md`): `systems.ts`, `publications.ts`, `upvotes.ts`,
`search.ts`, `generate.ts`, `visits.ts`, `payments.ts`, and the `queues/`, `workers/`, `services/`,
`webhooks/` trees. There is **no** OpenAI, BullMQ, Stripe, or SSE code wired in the API today.

### 2.3 Prisma schema (`apps/api/prisma/schema.prisma`)
- **Models present:** `User`, `Session`, `Account`, `Verification` (Better Auth), `Observatory`, `Domain`,
  `System`, `Publication`, `PublicationUpvote`, `AIGeneration`, `CreditTransaction`, `Subscription`,
  `ObservatoryVisit`. (The full ambitious MVP schema exists in the DB layer, but only `Observatory` and
  `Domain` are exposed through API routes today; `System`/`Publication`/`Upvote`/etc. have **no routes**.)
- **`Observatory` fields (real):** `id`, `userId @unique`, `name @unique`, `displayName`, `type`
  (`individual|studio|product`), `publicMode`, `visualSignature Json?`, `domainIds String[]`, `bio`,
  `socialLinks Json?`, `reputationScore`, `publicationsCount`, `createdAt`.
  **There is NO `world` column** — DL-39 confirmed still deferred.
- **`Domain` fields (real):** `id`, `name`, `slug @unique`, `description`, `theme`, `positionX`, `positionY`,
  `active` (default false), `createdAt`. `positionX/positionY` are **legacy 2D** coordinates from the SVG era;
  the WebGL 3D graph computes its own spherical positions and does not use them.

### 2.4 Seed (`apps/api/prisma/seed.ts`)
- **7 domains**, deterministic UUIDs: **Nexum, Keth, Solum = `active:true`**; **Vorda, Lyren, Auren,
  Draxis = `active:false`**. Matches DL-20 and `domain-definitions.md`.
- Also seeds **3 test users + 3 test observatories** (`test-observatory-1/2/3`).

### 2.5 Explore graph reality (`components/topology/TopologyGraph3D.tsx`, DL-43…DL-50)
- Real **WebGL 3D** via `react-force-graph-3d` + `three`, lazy `ssr:false`.
- **Spherical layout (DL-50):** RA at origin; domains on middle shell (golden-spiral); observatories on
  outer shell (cone-biased deterministic hash). Visible **lat/long sphere shell**. Positions **pinned +
  deterministic**, physics frozen. **OrbitControls** with clamped dolly.
- **Dark scene background = true black `#000000`**; light = paper canvas token; reacts to `data-theme` live.
- **No persistent in-scene labels** (identity via Inspector/Registry, DL-48). RA vibration; reduced glow;
  bloom stronger in dark, near-off in light. Resources disposed on unmount.

### 2.6 Create studio reality (`components/studio/ObservatoryStudio.tsx`, DL-42/DL-49)
- Steps: **`['World','Identity','Board','Signature','Finish']`** + a persistent live preview aside that
  renders through the shared `ObservatoryStory` (DL-49).
- `POST /api/v1/observatories` persists base fields; **board/photos/`world` are local-draft only**
  (`localStorage['rai-observatory-draft']`; photos session-only — no storage provider).

### 2.7 Dashboard reality (`app/dashboard/`, DL-47)
- Auth-gated; no-observatory → `/create`. Identity card + "as a node" static SVG preview + editable identity
  form (`PATCH /api/v1/me/observatory`, `name` read-only) + read-only local board-draft section. No
  Systems/Publications/Settings sub-screens.

### 2.8 ObservatoryStory shared renderer (`components/observatory/ObservatoryStory.tsx`, DL-49)
- One renderer presents a board as a directed art-story; used by **both** the Explore overlay and the studio
  preview. Additive optional block hints (`variant?`, `fullBleed?`).

### 2.9 Demo-seed mocks (`data/mock-observatories.ts`, DL-46/DL-48)
- Two: **`wawel-dragons-hill`** ("Wawel: The Dragon's Hill") and **`signal-garden`** ("Signal Garden").
  Both neutralized to present as plain observatories (`kind:'observatory'`, no world/real/virtual framing).

### 2.10 Single-world UI (DL-48)
- The virtual/real distinction is **not shown** anywhere in the UI. `world` (DL-39) and the
  `real-place`/`virtual-world` kinds are retained in data/types/studio draft as forward-looking flags only.

---

## 3. Contradiction & staleness list

Format: **file** — *stale claim* → **correction**.

### README.md
- *"premium observatory platform where AI systems publish research, prove capability, build reputation"* →
  RAi is a **universe of observatories** (art-stories about real places / virtual worlds) — DL-31.
- *Narrative line "Don't describe your AI. Prove it."* → **retired**; not present anywhere in the live UI.
- *Core MVP list: Systems / Publications / Upvote + Reputation / 3-step creation* → **not built**; current
  surfaces are the Terminal (`/`,`/explore`), the Observatory Studio (`/create`), and the owner Dashboard.
- *"Foundation rewrite in progress … locking the MVP scope (observatory + publication + reputation)"* →
  the pivot has shipped through PP-09; status must reflect the pivot era.

### ROADMAP.md
- *"Phase A — Foundation … Active issues: ISSUE-00 → ISSUE-03"* and the ISSUE-00…20 execution table →
  execution now runs as **patch-pivots PP-01…PP-09**, not the original issue pack.
- *Milestones 2–5 (topology alive, first publication, observatory public page, soft launch) as
  Not-Started* → topology is **live in 3D**; publications/observatory-public-page are **not built**; the
  milestone framing is pre-pivot.
- *"publish → prove → get discovered" core loop* → superseded by the observatory/art-story loop.

### docs/architecture.md
- *Tech Stack: "Visualization (current `/explore`) | SVG"* → **WebGL 3D** (`react-force-graph-3d` + `three`,
  lazy `ssr:false`, spherical deterministic layout) — DL-43/DL-50.
- *DL-30 note "Current `/explore` is Level 1 SVG topology … Three.js/R3F not required"* → superseded by DL-43.
- *apps/web structure: `(auth)/`, `dashboard/{systems,publications,publish,visual,settings}`,
  `observatory/[name]`, `publication/[id]`, `api/og`* → **none exist**; real routes are
  `/`,`/about`,`/create`,`/dashboard`,`/explore`,`/login`,`/signup`,`/privacy`,`/terms`.
- *components/topology: `TopologyCanvas/TopologyRA/TopologyDomains/TopologyObservatories/MiniMap`* →
  replaced by **`TopologyGraph3D.tsx`**.
- *Glass primitives "Planned shared primitive"* → **built** in PP-04 (DL-42).
- *apps/api structure: `systems/publications/upvotes/search/generate/visits/payments` routes +
  `queues/workers/services/webhooks`* → **none exist**; real files are `auth/domains/health/me/observatories`
  + `lib/{auth,observatory-validation,prisma,redis}` + `plugins/{auth-guard,rate-limit}`.
- *Data Flow: BullMQ/OpenAI/SSE for Visual Signature + Publication formatting* → **not built** (aspirational).
- Board/media content model + file storage: **UNBUILT**, blocked on a storage-provider decision (DL-41/42).

### docs/screens-spec.md
- *Screen List includes Systems / Publications Mgmt / Publish / Visual Signature / Observatory Public Page /
  Publication Page / Settings as real* → **not built**; mark Deferred/Not-built.
- *Screen 1: "How it works (publish → prove → get discovered)"* → pivot copy; `/` is the Terminal.
- *Screen 3 Login tagline "Don't describe your AI. Prove it."* → retired.
- *Screen 5 Explore: Feed/Observatories/Map views, SVG topology, "No Observatories as nodes",
  "No Three.js/R3F"* → the Explore terminal is Registry + 3D-sphere Topology + Inspector + Activity;
  observatories ARE nodes (DL-35/43/50).
- *Screen 6 Create: Step 1 Identity / Step 2 First Publication / Step 3 Visual Signature* → real steps are
  World→Identity→Board→Signature→Finish (DL-42); no publication step; manual signature.
- *Screen 7 Dashboard "Manage Systems / New Publication / Visual Signature / Settings" quick actions* →
  those sub-screens don't exist; the dashboard is the DL-47 baseline.

### docs/visual-reference.md
- *"Dark but readable. Dark mode only in MVP."*, *"Don't use light mode"*, *"Dark mode everywhere"* →
  **dual theme** (dark + light paper), DL-32.
- *Topology "SVG topology only … No Three.js/R3F … No Observatory nodes"* → superseded by DL-43/44/45; add
  DL-48 (theme-literal bg, no labels) and DL-50 (spherical, true-black dark) notes.
- *AI-research art-direction statement ("Every publication is evidence")* → concept superseded by DL-31
  (already has a top PIVOT NOTE; strengthen the closing statement).

### docs/domain-definitions.md
- Domains, active/coming-soon, slugs, descriptions: **accurate** (match seed).
- *"Map Positions … used in the intelligence topology visualization and must match the seed data"* →
  these 2D coordinates are **legacy** (SVG era); retained in seed/schema but **not used** by the 3D spherical
  layout. Framing ("AI capability and research", "visible on the map") lightly reconciled to the universe model.

### docs/concept-pivot.md
- Largely canonical already. *Rollout §6 stops at PP-06* → extend through PP-07/08/09. Add a one-line note
  that the current UI presents a **single world** (DL-48) even though the concept retains the two-worlds vision.

### Historical planning docs (vision, mvp-contract, world-structure, future-reference,
`github-issues-pack-v3`, backlog, si-target, mvp-to-si-bridge)
- Carry AI-research-era framing and old-concept strings ("publish research", "Don't describe your AI",
  metaverse/cosmic language, ISSUE-00…20 pack). These are **historical artifacts**. Rather than rewrite the
  planning history, each gets a **HISTORICAL / SUPERSEDED banner** at the top pointing to `concept-pivot.md`
  + DL-31, so every old-concept string in them is explicitly marked historical (not silently deleted).

---

## 4. Decision-log audit — supersession chains

No DL is renumbered or deleted. Annotations added in this task are marked ✎.

| DL | Status | Superseded / amended by | Reason (one line) |
|---|---|---|---|
| DL-10 (Three.js 2D topology) | superseded (for Explore) | DL-30, then **DL-43** (PP-05) | Explore is now real 3D, not 2D orthographic. |
| DL-13 (metaverse→AI-research pivot; "Prove it") ✎ | superseded (concept) | **DL-31** (PP-01) | Concept is now a universe of observatories. |
| DL-14 (terminology migration) | in force (partial) ✎ | context: DL-31 | Observatory/Domain terms persist; "publications/reputation as core" reframed by DL-31. |
| DL-15 (publications as core unit) ✎ | superseded (concept) | **DL-31** (PP-01) | Core unit is the observatory art-story, not AI publications. |
| DL-16 (systems as entities) ✎ | deferred/superseded | **DL-31** | No Systems surface in the pivot product. |
| DL-17 (upvotes) ✎ | deferred | **DL-31** | No upvote/publication surface built. |
| DL-21 (first publication in onboarding) ✎ | superseded | **DL-42** (PP-04) | Create is World→Identity→Board→Signature→Finish; no publication step. |
| DL-22 (reputation score) ✎ | recorded, not surfaced | context: DL-31 | `reputationScore` column exists; no reputation UI/formula engine built. |
| DL-30 (SVG two-level graph; no obs nodes) | superseded (clauses) | DL-35, **DL-43**, DL-46 | Obs nodes are first-class; Explore is 3D. |
| DL-33 (living motion) | amended twice | DL-33′ (PP-02), DL-37 (PP-03) | Starfield removed; crystal/drift added. In force. |
| DL-37 (Living Crystal Graph, SVG) | amended; SVG impl superseded | DL-37′ (PP-03), **DL-43** (PP-05) | Visual INTENT carried into 3D; SVG rendering retired. |
| DL-38 (SVG+CSS rendering) | superseded | **DL-43** (PP-05) | Explore renderer is WebGL 3D. |
| DL-39 (`world` lifecycle, recorded) | in force (deferred) | context DL-48 | `world` retained in data, hidden in UI. Column still not in schema. |
| DL-43 (3D force-directed graph) | layout + bg superseded | **DL-50** (layout, PP-09), DL-48→DL-50 (bg) | Spherical deterministic layout; true-black dark bg. Renderer/stack still in force. |
| DL-48 (single-world UI; theme-literal bg; no labels) ✎ | bg clause superseded | **DL-50** (dark = true black) | Single-world + no-labels still in force; only the dark background value changed. |

All the annotations above are written into `decision-log.md` as `> Superseded/Amended by …` note lines
(or reading-guide references), never by editing the original decision text.

---

## 5. Open questions

Items that could not be fully determined from code alone, or that are genuine drift to resolve with the
founder (kept honest here rather than guessed):

1. **`health` path prefix.** `GET /api/health` is registered with no prefix in `index.ts`; production
   milestone copy references `rai.app/...` while the API is deployed on Railway. The docs describe the
   Vercel↔Railway split (DL-24); the exact public health URL on production is deployment config, not code.
2. **Test observatories in the public list.** `seed.ts` creates `test-observatory-1/2/3` with `publicMode`
   defaulting to `true` (schema default). If seeded in a live DB, they would appear in `GET
   /api/v1/observatories` and therefore on the Explore graph. Whether the deployed DB carries them is an
   environment fact, not visible in code — flagged for the founder.
3. **Legacy `Domain.positionX/positionY`.** Retained in schema + seed but unused by the 3D layout. Keep as
   historical, or drop in a future migration? Left as-is (docs-only task); noted for a future schema pass.
4. **Ambitious schema vs. built API.** `System`, `Publication`, `PublicationUpvote`, `AIGeneration`,
   `CreditTransaction`, `Subscription`, `ObservatoryVisit` exist as Prisma models but have **no routes,
   services, or UI**. They are pre-pivot scaffolding retained in the DB layer. Whether they survive the pivot
   or get pruned is a product decision for a future patch, not this docs pass.
5. **World Mode naming.** DL-34 keeps "World Mode" as a placeholder name ("do not invent one"); docs keep the
   placeholder. Final name is a founder decision.
6. **Vault state.** This task does not read or write the Obsidian `rai-vault`; whether the vault already
   drifted from these docs is delegated to the Codex run (`CODEX-vault-sync-prompt.md`), which is instructed
   to flag any drift back to the founder.

---

## 6. Self-consistency note

After the reconciliation edits in this task, the repo docs were re-read for cross-file contradictions:

- **Concept:** `concept-pivot.md` is the single canonical concept; `decision-log.md` reading guide points to
  it; `README`/`ROADMAP`/`screens-spec`/`architecture`/`visual-reference` all describe the same universe-of-
  observatories model and the same current surfaces (Terminal / Studio / Dashboard).
- **Explore renderer:** every doc that mentions the topology now says WebGL 3D + spherical (DL-43/50); the
  old "SVG / no Three.js / no observatory nodes" statements are either corrected (active docs) or annotated as
  superseded (visual-reference inline notes).
- **API surface:** `architecture.md` lists exactly the nine real endpoints; no doc claims Systems/Publications/
  Upvotes/Payments endpoints as built (they appear only as historical planning or explicitly-deferred).
- **Theme:** no active doc says "dark only"; dual theme (DL-32) is consistent across `concept-pivot`,
  `visual-reference`, and `screens-spec`.
- **World model:** every active doc states the current UI is single-world (DL-48) with `world` retained as a
  forward flag; none imply a shipped virtual/real toggle or Earth map.

**Residual conflicts:** none blocking. The only intentional "two truths" are in the historical planning docs,
which are explicitly banner-marked as superseded rather than rewritten (see §3). Any deeper drift is captured
in §5 Open questions.
