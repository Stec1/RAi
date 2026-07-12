# RAi — Architecture Contract

> Technical architectural contract for agent and founder.
> Agent reads this document before every prompt.
> Architecture changes are recorded here — not invented during issue execution.

**Last updated:** 2026-07-09 — reconciled to the post-PATCH-PIVOT-09 reality (DOC-SYNC-01). For the built-vs-planned map see [`_reconciliation/PP-01-09-reconciliation.md`](_reconciliation/PP-01-09-reconciliation.md).

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | Next.js | 14.x | App Router only — no Pages Router |
| Backend | Fastify | 4.x | Monolith — no microservices |
| ORM | Prisma | 7.x | Prisma config + migrations only — no `db push` |
| Database | PostgreSQL | 15+ | Railway or Neon |
| Cache / Queue | Redis | 7.x | Upstash or Railway |
| Queue Worker | BullMQ | 4.x | On top of Redis |
| Auth | Better Auth | 1.x | Session cookies — no JWT |
| AI | OpenAI GPT-4o | latest | Structured output |
| Payments | Stripe | latest | Test mode until launch |
| Visualization (`/explore` topology) | `react-force-graph-3d` + `three` | `1.29.1` (pinned) on existing `three` | WebGL 3D graph, lazy `next/dynamic` `ssr:false`; deterministic spherical layout + UnrealBloom (DL-43/DL-50) |
| AI (OpenAI, BullMQ, SSE) | — | — | **Not built.** Listed rows above (OpenAI/Stripe/Resend/PostHog/Sentry/BullMQ) are the earlier plan; no such code is wired in the API today |
| Email | Resend | latest | Transactional only |
| File Storage | Cloudflare R2 | — | No local file storage |
| Analytics | PostHog | latest | Event-based |
| Error tracking | Sentry | latest | Frontend + backend |
| Logging | Pino | 8.x | JSON format, no console.log |
| Monorepo | pnpm workspaces | 8.x | No Turborepo until needed |
| Deploy FE | Vercel | — | Auto-deploy from main |
| Deploy BE | Railway | — | Node.js 20 |
| CI/CD | GitHub Actions | — | lint + typecheck + deploy |

---


> **Topology note (superseded):** the DL-30 "current `/explore` is SVG, no Three.js" stance is superseded by **DL-43** (PATCH-PIVOT-05) and **DL-50** (PATCH-PIVOT-09). `/explore` renders a real WebGL 3D graph (`react-force-graph-3d` + Three.js) with a deterministic spherical layout, lazy client-only (`ssr:false`). No WebSocket/real-time graph architecture is introduced.

## Repo Structure
```
rai/
├── apps/
│   ├── web/                    # Next.js 14 App Router
│   └── api/                    # Fastify backend
├── packages/
│   └── shared/                 # Shared TypeScript types and utils
├── docs/                       # Documentation layer
│   └── archive/                # Archived docs from previous versions
├── prompts/                    # Agent prompt library
├── tests/
│   └── load/                   # k6 load test scripts
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── .env.example
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── pnpm-workspace.yaml
└── package.json
```

---

## apps/web Structure
```
apps/web/
├── src/
│   ├── app/                    # App Router routes (FLAT — no route groups)
│   │   ├── page.tsx            # `/`         → <RaiTerminal/> (the universe)
│   │   ├── explore/            # `/explore`  → the SAME <RaiTerminal/>
│   │   ├── create/             # `/create`   → Observatory Studio (DL-42)
│   │   ├── dashboard/          # `/dashboard`→ owner Dashboard (DL-47)
│   │   ├── about/  login/  signup/  privacy/  terms/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── terminal/           # RaiTerminal, TerminalHeader, RegistryRail,
│   │   │                       #   ActivityStrip, ArtStoryOverlay, GuestIntroPanel
│   │   ├── topology/           # TopologyGraph3D (WebGL 3D graph), ExploreInfoPanel
│   │   ├── observatory/        # ObservatoryStory (shared art-story renderer, DL-49)
│   │   ├── studio/             # ObservatoryStudio, NodePreview
│   │   ├── dashboard/          # DashboardScreen
│   │   ├── auth/               # AuthCard/Field/Shell/Submit, LoginForm, SignupForm
│   │   ├── landing/            # TopBar, Footer, Reveal
│   │   ├── theme/              # ThemeToggle (data-theme, DL-32)
│   │   └── ui/                 # GlassCard, GlassPanel, GlassButton, PageShell (DL-42 — BUILT)
│   ├── data/
│   │   └── mock-observatories.ts    # two demo-seed mocks: Wawel, Signal Garden (DL-46)
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── auth-client.ts
│   │   ├── post-auth-redirect.ts
│   │   ├── topology-types.ts
│   │   └── universe-observatories.ts   # real↔mock merge (DL-46)
│   └── styles/
├── next.config.mjs
└── package.json
```

---

## apps/api Structure
```
apps/api/
├── prisma.config.ts           # Prisma 7 configuration entrypoint
├── src/
│   ├── index.ts                # registers: health, auth, me, observatories, domains
│   ├── routes/
│   │   ├── health.ts           # GET /api/health
│   │   ├── auth.ts             # Better Auth handler (/api/auth/*)
│   │   ├── me.ts               # GET /api/me; GET|PATCH /api/v1/me/observatory (DL-47)
│   │   ├── observatories.ts    # GET check/:name; GET / (public list, DL-46); POST / (create, DL-41)
│   │   └── domains.ts          # GET /api/v1/domains
│   ├── lib/
│   │   ├── auth.ts             # Better Auth config
│   │   ├── observatory-validation.ts   # shared validators (name/type/socialLinks/visualSignature)
│   │   ├── prisma.ts           # Prisma singleton
│   │   └── redis.ts            # Redis singleton
│   └── plugins/
│       ├── auth-guard.ts       # requireAuth + request.user
│       └── rate-limit.ts       # observatory rate limiters
├── prisma/
│   ├── schema.prisma
│   ├── generated/              # generated Prisma client
│   └── seed.ts                 # 7 domains (3 active) + test users/observatories
└── package.json

# NOT built (were in the earlier issue pack): routes systems/publications/upvotes/
# search/generate/visits/payments; queues/, workers/, services/ (openai, credits,
# reputation, stripe, email), webhooks/. No BullMQ/OpenAI/Stripe/SSE code exists today.
```

---

## API Surface (current)

The API is a Fastify monolith. Five route files are registered in `src/index.ts` (`health`,
`auth`, `me`, `observatories` at prefix `/api/v1/observatories`, `domains` at prefix
`/api/v1/domains`). The complete current surface:

| Method + path | Auth | Notes |
|---|---|---|
| `GET /api/health` | no | `{ status, timestamp }` |
| `GET\|POST /api/auth/*` | — | Better Auth (email sign-up/in, sign-out, get-session; session cookies, DL-09/DL-24) |
| `GET /api/me` | yes | account summary; `observatory {id,name} \| null` |
| `GET /api/v1/me/observatory` | yes | caller's full observatory (base fields) or 404 (DL-47) |
| `PATCH /api/v1/me/observatory` | yes | update base fields; **`name` immutable**; base fields only / no schema change (DL-47) |
| `GET /api/v1/observatories/check/:name` | no | name availability |
| `GET /api/v1/observatories` | no | public list (`publicMode:true`), base fields, limit 500 (DL-46) |
| `POST /api/v1/observatories` | yes | create; base fields only; one-per-user; no schema change (DL-41) |
| `GET /api/v1/domains` | no | all 7 seeded domains |

**Not built** (were in the earlier issue pack): Systems, Publications, Upvotes, Search, Generate
(AI), Visits, and Payments endpoints; the BullMQ queues/workers; the OpenAI/Stripe/SSE services.
**Board / media persistence and file/object storage are UNBUILT and blocked on a storage-provider
decision** (DL-41/DL-42) — the studio board, photos, and the `world` choice stay local drafts until then.

---

## packages/shared Structure
```
packages/shared/
├── src/
│   ├── types/
│   │   ├── visual-signature.ts # VisualSignature
│   │   ├── observatory.ts      # Observatory, ObservatoryType
│   │   ├── domain.ts           # Domain
│   │   ├── system.ts           # System, SystemType, SystemStatus
│   │   ├── publication.ts      # Publication, PublicationStatus
│   │   ├── user.ts             # User, PlanTier
│   │   └── index.ts
│   └── utils/
│       ├── hash.ts             # nameHash() for topology positions
│       └── constants.ts        # DOMAIN_SLUGS, OBSERVATORY_TYPES, etc.
└── package.json
```

**Rule:** `packages/shared` contains only types and pure utility functions. No business logic. No HTTP calls. No DB queries.

---

## Database Schema Overview

| Table | Purpose |
|---|---|
| `User` | Accounts, plan tier, credits balance, Stripe customer ID |
| `Observatory` | Observatories: name (unique), userId (unique), displayName, type, publicMode, visualSignature (JSONB), domainIds[], bio, socialLinks (JSONB), reputationScore, publicationsCount. **No `world` column** (DL-39 deferred). |
| `Domain` | 7 thematic Domains — seed data only, includes `active` boolean |
| `System` | AI agents/tools registered by Observatory owners |
| `Publication` | Formatted proof of work: title, summary, keyFindings, body, upvoteCount |
| `PublicationUpvote` | One upvote per user per publication (unique constraint) |
| `AIGeneration` | Generation history, Visual Signature and publication formatting snapshots |
| `CreditTransaction` | All credit balance changes |
| `Subscription` | Stripe subscription sync |
| `ObservatoryVisit` | Visit records for Observatories |

> **Built vs. scaffolding:** only `Observatory` and `Domain` are exposed through API routes today. `System`, `Publication`, `PublicationUpvote`, `AIGeneration`, `CreditTransaction`, `Subscription`, and `ObservatoryVisit` exist as Prisma models (pre-pivot scaffolding) with **no routes, services, or UI**. The credit/reputation/publication mechanics below describe intent, not built behavior.

**Critical rule (for if/when credits ship):** Credit balance changes ONLY via `CreditTransaction` + `User.creditsBalance` in a single Prisma transaction. Never separately.

---

## Prisma & Database Workflow

- Prisma schema source of truth: `apps/api/prisma/schema.prisma`
- Prisma configuration: `apps/api/prisma.config.ts`
- Migration history: `apps/api/prisma/migrations/`
- Seed data script: `apps/api/prisma/seed.ts`
- Local environment setup: copy `.env.example` to `.env.local` and provide at minimum `DATABASE_URL` and `REDIS_URL`.

**Rules:**
- All schema changes go through `schema.prisma` + a new migration in `prisma/migrations/`.
- Do not edit previously applied migrations.
- Use seed script updates for deterministic baseline data (for example, Domains).

---

## Data Flow — High Level

> **Reality check:** the high-level web → API → Postgres → Redis path is real. The **Visual Signature Generation** and **Publication Formatting** flows below (BullMQ workers, OpenAI GPT-4o, SSE progress) are **NOT built** — there is no OpenAI, BullMQ, or SSE code in the API today. They are retained as the earlier plan.
```
User (Browser)
    ↓ HTTPS
Next.js App (Vercel)
    ↓ API calls
Fastify API (Railway)
    ↓ Prisma
PostgreSQL (Railway)

Fastify API
    ↓ ioredis
Redis (Upstash / Railway)

--- Visual Signature Generation ---
Fastify API → BullMQ Job → visualSignatureWorker
    ↓ OpenAI API
GPT-4o (structured output → VisualSignature JSON)
    ↓
PostgreSQL (AIGeneration saved + Observatory.visualSignature updated)
    ↓ SSE
Browser (progress updates → topology visual update)

--- Publication Formatting ---
Fastify API → BullMQ Job → publicationFormatWorker
    ↓ OpenAI API
GPT-4o (structured output → formatted publication JSON)
    ↓
PostgreSQL (AIGeneration saved + Publication created/updated)
    ↓ SSE
Browser (progress updates → formatted preview)
```

---

## VisualSignature Type
```typescript
type VisualSignature = {
  primaryColor: string;       // hex color
  secondaryColor: string;     // hex color
  gradientAngle: number;      // 0–360
  ambientEffect: string;      // "glow" | "pulse" | "static" | "drift"
  effectIntensity: number;    // 0–1
  surfaceStyle: string;       // "smooth" | "grain" | "mesh" | "void"
  accentColor: string;        // hex color
  nodeStyle: string;          // "point" | "ring" | "pulse" | "cross"
}
```

---

## Architecture Rules

### Forbidden
- Business logic in `packages/shared`
- Circular imports between `apps/web` and `apps/api`
- Direct DB access from `apps/web`
- `any` type without explicit comment
- Hardcoded credentials or secrets
- Editing already-applied Prisma migrations
- In-memory rate limiting in production
- Local file storage
- `pages/` directory in Next.js
- Old terminology in code (Star, Planet, Satellite, atmosphereParams)

### Required
- All schema changes via new migration — never `prisma db push`
- All new env vars immediately in `.env.example` with comment
- All architectural decisions in `docs/decision-log.md`
- TypeScript strict mode in all packages
- Pino logger for all server-side operations
- Prisma client only via singleton `lib/prisma.ts`
- Redis client only via singleton `lib/redis.ts`

---

## Module Boundaries

| Module | Can read | Cannot read |
|---|---|---|
| apps/web components | packages/shared | apps/api |
| apps/web hooks | packages/shared, apps/web lib | apps/api source |
| apps/api routes | prisma, packages/shared | apps/web |
| apps/api services | prisma, redis, packages/shared | apps/web |
| apps/api workers | prisma, redis, packages/shared, services | apps/web, routes |
| packages/shared | — | apps/web, apps/api |

---

## Env Variable Policy

All env vars documented in `.env.example` with description. No hard-coding. No secrets in code or git history.

**Naming convention:**
- `NEXT_PUBLIC_*` — public frontend variables
- `*_URL` — connection strings
- `*_KEY` — API keys
- `*_SECRET` — webhook secrets, signing keys

**Priority:** Railway env > Vercel env > `.env.local`

**Local expectation:** `.env.local` is developer-local only and should be derived from `.env.example`, including required `DATABASE_URL` and `REDIS_URL`.

---

## When to Update This Document

Update this document after any merge that:
- Adds a new service or technology to the stack
- Changes folder structure or module boundaries
- Adds a new table or changes schema logic
- Introduces a new architectural decision
- Changes data flow or AI generation flow

Updates are part of the same PR — not a separate commit.
