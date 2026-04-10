# RAi — Architecture Contract

> Technical architectural contract for agent and founder.
> Agent reads this document before every prompt.
> Architecture changes are recorded here — not invented during issue execution.

**Last updated:** [date after each significant merge]

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | Next.js | 14.x | App Router only — no Pages Router |
| Backend | Fastify | 4.x | Monolith — no microservices |
| ORM | Prisma | 5.x | Migrations only — no `db push` |
| Database | PostgreSQL | 15+ | Railway or Neon |
| Cache / Queue | Redis | 7.x | Upstash or Railway |
| Queue Worker | BullMQ | 4.x | On top of Redis |
| Auth | Better Auth | 1.x | Session cookies — no JWT |
| AI | OpenAI GPT-4o | latest | Structured output |
| Payments | Stripe | latest | Test mode until launch |
| Visualization | Three.js | r128+ | Orthographic 2D/2.5D canvas for intelligence topology |
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
│   ├── app/
│   │   ├── (auth)/             # login, signup
│   │   ├── about/
│   │   ├── create/             # Create Observatory flow
│   │   ├── explore/            # Explore: feed, observatories, map
│   │   ├── dashboard/          # Control Panel
│   │   │   ├── systems/        # Systems management
│   │   │   ├── publications/   # Publications management
│   │   │   ├── publish/        # Create new publication
│   │   │   ├── visual/         # Visual Signature generator
│   │   │   └── settings/       # Account settings
│   │   ├── observatory/
│   │   │   └── [name]/         # Observatory Public Page
│   │   ├── publication/
│   │   │   └── [id]/           # Publication standalone page
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── api/
│   │   │   └── og/             # OG image generation
│   │   └── layout.tsx
│   ├── components/
│   │   ├── topology/           # Intelligence topology components
│   │   │   ├── TopologyCanvas.tsx   # Main visualization canvas
│   │   │   ├── TopologyRA.tsx
│   │   │   ├── TopologyDomains.tsx
│   │   │   ├── TopologyObservatories.tsx
│   │   │   └── MiniMap.tsx
│   │   ├── panels/             # Slide-in info panels
│   │   ├── creation/           # 3-step creation flow components
│   │   ├── publications/       # Publication card, formatting preview
│   │   ├── ui/                 # Reusable UI primitives
│   │   └── layouts/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTopology.ts
│   │   └── useDeviceDetect.ts
│   ├── lib/
│   │   ├── posthog.ts
│   │   ├── api-client.ts
│   │   └── topology-utils.ts   # nameHash, coordinate generation
│   └── styles/
├── public/
├── next.config.mjs
└── package.json
```

---

## apps/api Structure
```
apps/api/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── observatories.ts
│   │   ├── domains.ts
│   │   ├── systems.ts
│   │   ├── publications.ts
│   │   ├── upvotes.ts
│   │   ├── search.ts
│   │   ├── generate.ts         # Visual Signature + publication formatting
│   │   ├── visits.ts
│   │   ├── payments.ts
│   │   └── health.ts
│   ├── plugins/
│   │   ├── auth-guard.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   ├── queues/
│   │   ├── visualSignatureQueue.ts
│   │   └── publicationFormatQueue.ts
│   ├── workers/
│   │   ├── visualSignatureWorker.ts
│   │   └── publicationFormatWorker.ts
│   ├── services/
│   │   ├── openai.ts
│   │   ├── credits.ts
│   │   ├── reputation.ts
│   │   ├── stripe.ts
│   │   └── email.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── logger.ts
│   └── webhooks/
│       └── stripe.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── package.json
```

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
| `Observatory` | Research spaces: name, type, publicMode, visualSignature (JSONB), domainIds[], bio, socialLinks (JSONB), reputationScore, publicationsCount |
| `Domain` | 7 thematic Domains — seed data only, includes `active` boolean |
| `System` | AI agents/tools registered by Observatory owners |
| `Publication` | Formatted proof of work: title, summary, keyFindings, body, upvoteCount |
| `PublicationUpvote` | One upvote per user per publication (unique constraint) |
| `AIGeneration` | Generation history, Visual Signature and publication formatting snapshots |
| `CreditTransaction` | All credit balance changes |
| `Subscription` | Stripe subscription sync |
| `ObservatoryVisit` | Visit records for Observatories |

**Critical rule:** Credit balance changes ONLY via `CreditTransaction` + `User.creditsBalance` in a single Prisma transaction. Never separately.

---

## Data Flow — High Level
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

---

## When to Update This Document

Update this document after any merge that:
- Adds a new service or technology to the stack
- Changes folder structure or module boundaries
- Adds a new table or changes schema logic
- Introduces a new architectural decision
- Changes data flow or AI generation flow

Updates are part of the same PR — not a separate commit.
