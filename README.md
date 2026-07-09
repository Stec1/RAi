# RAi

RAi is a **universe of observatories** — art-stories about real places (a castle, a restaurant,
a street, an event, a business) and virtual worlds (generative art, imagined spaces), published
by people and, in time, verified by community. The universe is explored as a one-page **terminal**
hosting a living 3D graph.

> **Concept pivot.** RAi began as a "publish → prove → get discovered" platform for AI systems.
> It pivoted to the universe-of-observatories model across nine patches (PP-01…PP-09). The
> canonical concept is **[`docs/concept-pivot.md`](docs/concept-pivot.md)**; the full
> built-vs-planned map is **[`docs/_reconciliation/PP-01-09-reconciliation.md`](docs/_reconciliation/PP-01-09-reconciliation.md)**.

---

## What exists now (post-PP-09)

- **RAI Terminal** on `/` and `/explore` — a WebGL 3D **spherical** universe graph (RA at the
  center, the 7 Domains on a middle shell, observatories on an outer shell) with a Registry rail,
  a docked Inspector, and an Activity strip. Dark and light "paper" themes.
- **Observatory art-story** — each observatory opens as a full-screen directed story via the
  shared `ObservatoryStory` renderer.
- **Observatory Studio** at `/create` — World → Identity → Board → Signature → Finish, with a live
  preview. `POST /api/v1/observatories` persists base fields; the board, photos, and `world` choice
  are local drafts (no storage provider yet).
- **Owner Dashboard** at `/dashboard` — view and edit the observatory (`GET`/`PATCH
  /api/v1/me/observatory`; `name` is immutable).
- **Discovery API** — `GET /api/v1/observatories` (public) feeds the graph, merged with two
  demo-seed mocks (Wawel, Signal Garden) so the universe is never empty.
- **Auth** — Better Auth email + session cookies; `/login`, `/signup`, and post-auth routing.
- **7 Domains** seeded — Nexum, Keth, Solum active; Vorda, Lyren, Auren, Draxis coming soon.

## Not built yet (deferred / recorded)

- **World Mode** — the real-world map + virtual↔real toggle. The `world` field is a hidden
  forward-looking flag today (DL-34 / DL-39 / DL-48).
- **Board / media publishing + file storage** — blocked on a storage-provider decision (DL-42).
- **Earlier AI-research surfaces** — Systems, Publications, AI formatting, Upvotes/Reputation
  engine, Visual-Signature AI generation, the public `/observatory/:name` and `/publication/:id`
  pages, Settings. Some of these exist in the Prisma schema only, as unused scaffolding.
- **Community layer** — comments, contestation, community verification, ambassador monetization —
  and idea-to-reality funding — documented future scope only (DL-40, `docs/concept-pivot.md` §4).

---

## Stack

Next.js 14 (App Router) · Fastify (monolith) · Prisma + PostgreSQL · Better Auth (session cookies)
· Redis · pnpm workspaces. The Explore graph uses `react-force-graph-3d` + `three` (lazy,
client-only). Web deploys on Vercel, API on Railway (cross-origin cookie auth — DL-24).

```
rai/
├── apps/
│   ├── web/     # Next.js 14 App Router (the Terminal, Studio, Dashboard, auth)
│   └── api/     # Fastify (health, auth, me, observatories, domains)
├── packages/
│   └── shared/  # shared TypeScript types + pure utils
└── docs/        # documentation layer (see index below)
```

---

## Documentation

Core documents live in `/docs`. Start with the concept and the reconciliation map, then the
decision log.

| File | Purpose |
|---|---|
| `docs/concept-pivot.md` | **Canonical concept** — the universe of observatories |
| `docs/_reconciliation/PP-01-09-reconciliation.md` | **Built-vs-planned map** across PP-01…PP-09 (source of truth for "what's real") |
| `docs/decision-log.md` | All decisions (DL-01…DL-50) with supersession annotations |
| `docs/architecture.md` | Tech stack, real API surface, repo structure, schema |
| `docs/screens-spec.md` | Every screen/route with built / not-built status |
| `docs/domain-definitions.md` | The 7 Domains: names, themes, seed data |
| `docs/visual-reference.md` | Art direction, color, typography, motion (dual theme) |
| `docs/vision.md` · `docs/mvp-contract.md` · `docs/world-structure.md` · `docs/future-reference.md` · `docs/github-issues-pack-v3.md` · `docs/backlog.md` | **Historical / pre-pivot planning** — banner-marked, kept for history |
| `docs/si-target.md` · `docs/mvp-to-si-bridge.md` | Long-term "System Intelligence" north-star (post-MVP) |
| `ROADMAP.md` | Phases + what exists now |

### Archived
| File | Reason |
|---|---|
| `docs/archive/planet-definitions-v1.md` | Replaced by `docs/domain-definitions.md` |
| `docs/archive/github-issues-pack-v2.md` | Replaced by `docs/github-issues-pack-v3.md` |

---

## Development

pnpm monorepo. Recent work ships as reviewed "patch-pivot" branches (PP-01…PP-09) merged to
`main`. Architectural decisions are recorded in `docs/decision-log.md` as part of the same change.

## License

MIT
