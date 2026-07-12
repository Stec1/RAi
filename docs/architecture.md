# RAi — Architecture (RAI 2.0 target)

> Target architecture for the rewrite. Where something is not built yet, it is marked
> **planned** with its delivering R-step. The current (v1) code inventory with per-path
> disposition lives in [`kill-map.md`](kill-map.md); the archived v1 architecture is at
> [`archive/v1/architecture.md`](archive/v1/architecture.md).

---

## 1. Chassis — kept (R-DL-11)

| Layer | Technology | Notes |
|---|---|---|
| Monorepo | pnpm workspaces | `apps/web`, `apps/api`, `packages/shared` |
| Frontend | Next.js 14 App Router | CSS Modules + token system + dual theme (dark / light paper) |
| 3D | `react-force-graph-3d` + `three` | lazy `next/dynamic`, `ssr:false`; WebGL fallback |
| Backend | Fastify monolith | routes + plugins; Pino logging |
| ORM / DB | Prisma + PostgreSQL | migrations only, no `db push` |
| Cache / rate limit | Redis | via `apps/api/src/lib/redis.ts` |
| Auth | Better Auth | session cookies; same-origin `/api/*` proxy in `next.config.mjs` (browser never talks cross-site) |
| Deploy | Vercel (web) + Railway (api) | `API_PROXY_ORIGIN` env wires the proxy |
| Shared code | `packages/shared` | types + pure utils only |

The renderer contracts that survive v1: **ObservatoryStory** (the single world renderer) and
**VisualSignature** (the identity parameter set). Both evolve; neither restarts.

---

## 2. Target data model

Changes land as one consolidated migration per phase (R-DL-09); migration #1 ships at R-01.

**Observatory (evolves at R-01):**
- gains `visibility` enum: `unpublished` | `private` | `public` (replaces `publicMode`; mapping
  of existing rows = OQ-06)
- gains server-persisted **content blocks** as JSONB (the ObservatoryStory block sequence; ends
  the localStorage-draft era, R-DL-06)
- keeps: `userId @unique` (one world per person), `name @unique` (the `@name` address, immutable),
  `displayName`, `visualSignature` (JSONB), `bio`, `socialLinks`, `createdAt`
- loses: `domainIds` (R-01, with the Domain model)

**Domains — removed (R-01):** the `Domain` model, its seed data, `GET /api/v1/domains`, and all
`domainIds` validation are demolished (R-DL-02). Nothing in v2 references a domain.

**Media (planned, R-02):** objects on **Cloudflare R2**, uploaded via presigned URLs issued by
the API; the DB stores object keys/URLs inside content blocks (exact record shape decided at
R-02). No local file storage.

**Billing/AI substrate — retained (R-DL-12):** `User.planTier`, `User.creditsBalance`,
`AIGeneration` (composer generations metered here from R-06; enum values evolve then),
`CreditTransaction`, `Subscription`.

**Legacy — slated for drop at R-10 (pending OQ-05):** `System`, `Publication`,
`PublicationUpvote`, `ObservatoryVisit` and their enums. No routes or UI reference them today.

---

## 3. Target API surface (v2 — planned unless marked live)

| Method + path | Step | Notes |
|---|---|---|
| `GET /api/health` | live | unchanged |
| `GET\|POST /api/auth/*` | live | Better Auth, unchanged |
| `GET /api/me` | live | account summary; evolves with visibility at R-01 |
| `GET /api/v1/observatories/check/:name` | live | name availability; kept |
| World CRUD + content: `GET\|PATCH /api/v1/me/observatory` (+ content blocks), `POST /api/v1/observatories` | R-01 | evolve existing routes; `visibility` transitions included |
| Public world fetch by name | R-01 | powers `/@name`; enforces visibility server-side |
| Public graph list | R-01 | `public` worlds only: name, displayName, visualSignature; replaces the v1 list shape (drops domainIds) |
| Media presign | R-02 | issue R2 presigned upload URLs; auth required |
| RA composer endpoints | R-06 | server-side Anthropic API, **streaming**; metered into `AIGeneration` + `CreditTransaction`; cost guards + rate limits |
| Stripe checkout/webhooks | R-09 | entitlements to `planTier`/`Subscription` |
| `GET /api/v1/domains` | removed R-01 | demolished with the Domain model |

**Secrets live server-side only.** The Anthropic key, R2 credentials, and Stripe keys exist only
in the API environment (Railway). The browser talks to the API exclusively through the
same-origin proxy; no key ever reaches the client bundle.

---

## 4. Migration policy (R-DL-09)

- The v1 migration freeze is lifted at GENESIS.
- **One consolidated Prisma migration per phase** (Phase 1 → migration #1 at R-01, etc.); no
  micro-migrations inside a phase.
- Every R-step leaves the deployed app working, using the interim adaptations specified in the
  kill-map (e.g. hash-based node placement between R-01 and R-03).
- Existing-row data decisions that need the founder (visibility mapping, production seed rows)
  are in [`open-questions.md`](open-questions.md), not guessed in migrations.

---

## 5. Infra prerequisites (founder-provided; see open-questions.md)

| Need | By step |
|---|---|
| Anthropic API key + monthly spend limit | R-06 |
| Cloudflare R2 account (bucket + access keys) | R-02 |
| Stripe account + pricing | R-09 |
