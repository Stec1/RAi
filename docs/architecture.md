# RAi — Architecture Contract

> Technical architectural contract for Cursor Agent and founder.
> Cursor Agent reads this document before every prompt.
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
| Map | Three.js | r128+ | Orthographic 2D/2.5D canvas |
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
├── prompts/                    # Cursor + Claude prompt library
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
│   │   ├── create/             # Create Your Meta flow
│   │   ├── explore/            # Explore map screen
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── star/
│   │   │   └── [name]/         # Public Star Preview
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── api/
│   │   │   └── og/             # OG image generation
│   │   └── layout.tsx
│   ├── components/
│   │   ├── map/                # WebGL map components
│   │   │   ├── ExploreMap.tsx  # Main map canvas
│   │   │   ├── MapRA.tsx
│   │   │   ├── MapPlanets.tsx
│   │   │   ├── MapStars.tsx
│   │   │   └── MiniMap.tsx
│   │   ├── panels/             # Slide-in info panels
│   │   ├── creation/           # 3-step creation flow components
│   │   ├── ui/                 # Reusable UI primitives
│   │   └── layouts/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useMap.ts
│   │   └── useDeviceDetect.ts
│   ├── lib/
│   │   ├── posthog.ts
│   │   ├── api-client.ts
│   │   └── map-utils.ts        # nameHash, coordinate generation
│   └── styles/
├── public/
├── next.config.ts
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
│   │   ├── stars.ts
│   │   ├── planets.ts
│   │   ├── generate.ts
│   │   ├── visits.ts
│   │   ├── payments.ts
│   │   ├── notifications.ts
│   │   └── health.ts
│   ├── plugins/
│   │   ├── auth-guard.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   ├── queues/
│   │   └── atmosphereQueue.ts
│   ├── workers/
│   │   └── atmosphereWorker.ts
│   ├── services/
│   │   ├── openai.ts
│   │   ├── credits.ts
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
│   │   ├── atmosphere.ts       # AtmosphereParams
│   │   ├── star.ts             # Star, StarType
│   │   ├── planet.ts           # Planet
│   │   ├── user.ts             # User, PlanTier
│   │   └── index.ts
│   └── utils/
│       ├── hash.ts             # nameHash() for map positions
│       └── constants.ts        # PLANET_SLUGS, STAR_TYPES, etc.
└── package.json
```

**Rule:** `packages/shared` contains only types and pure utility functions. No business logic. No HTTP calls. No DB queries.

---

## Database Schema Overview

| Table | Purpose |
|---|---|
| `User` | Accounts, plan tier, credits balance |
| `Star` | Meta Stars: name, type, publicMode, atmosphereParams (JSONB), planetIds[] |
| `Planet` | 7 thematic planets — seed data only |
| `Satellite` | Satellites bound to planets — seed/empty, reserved for Phase 2 |
| `AIGeneration` | Generation history, AtmosphereParams snapshots |
| `CreditTransaction` | All credit balance changes |
| `Subscription` | Stripe subscription sync |
| `StarVisit` | Anonymous visit records |

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

Fastify API → BullMQ Job → atmosphereWorker
    ↓ OpenAI API
GPT-4o (structured output → AtmosphereParams JSON)
    ↓
PostgreSQL (AIGeneration saved + Star.atmosphereParams updated)
    ↓ SSE
Browser (progress updates → map visual update)
```

---

## AtmosphereParams Type
```typescript
type AtmosphereParams = {
  primaryColor: string;       // hex color
  secondaryColor: string;     // hex color
  fogDensity: number;         // 0–1
  particleType: string;       // "stars" | "dust" | "fireflies" | "void"
  particleCount: number;      // 0–1000
  ambientMood: string;        // "calm" | "neutral" | "intense"
  glowIntensity: number;      // 0–1
  mapMarkerStyle: string;     // "point" | "ring" | "pulse" | "cross"
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
