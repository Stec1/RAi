# RAi

RAi is a universe where you compose your world with RA — the mind at the center — and it lives
as a glowing node among everyone else's. You describe your idea to RA; RA composes a draft world
within the platform's design system (blocks + VisualSignature); you refine it by conversation,
add your own images and final words, and publish. Every world gets a permanent address
(`rai.app/@name`) with three visibility levels — unpublished, private, public — and public worlds
appear as colored nodes on the full-screen meta-graph around RA.

---

## Status

**GENESIS in progress** — a founder-approved full rewrite (RAI 2.0), executed as steps
R-00…R-10. R-00 (this state) rewrote the documentation and produced the code kill-map; no product
functionality has changed yet, so the deployed app still shows RAi v1 behavior until the steps
land. Plan and status: [`docs/roadmap.md`](docs/roadmap.md).

## Documentation

The v2 canon lives in `docs/`:

| File | Purpose |
|---|---|
| [`docs/concept.md`](docs/concept.md) | Canonical concept — the universe, RA, worlds, visibility |
| [`docs/product-spec.md`](docs/product-spec.md) | Target surfaces (Explore, Composer, world page, Dashboard, auth/landing), tagged by delivering R-step |
| [`docs/architecture.md`](docs/architecture.md) | Kept chassis, target data model, target API v2, migration policy, infra prerequisites |
| [`docs/decision-log.md`](docs/decision-log.md) | The R-series decision log (starts at R-DL-01; the only authoritative record) |
| [`docs/roadmap.md`](docs/roadmap.md) | The GENESIS plan — phases 0–5, steps R-00…R-10 |
| [`docs/kill-map.md`](docs/kill-map.md) | Per-path disposition of the v1 code: KEEP / EVOLVE / DEMOLISH@R-XX / DROP@R-10, with per-step touch lists |
| [`docs/open-questions.md`](docs/open-questions.md) | Founder decisions pending, each tagged "needed by R-XX" |

**v1 documentation** (the original MVP plan and the nine pivot patches) is frozen history in
[`docs/archive/v1/`](docs/archive/v1/README.md). Nothing there describes the current direction.

## Stack

pnpm monorepo — `apps/web` (Next.js 14 App Router), `apps/api` (Fastify + Prisma + PostgreSQL +
Redis, Better Auth), `packages/shared` (types + pure utils). Web on Vercel, API on Railway,
same-origin `/api/*` proxy. The graph renders with `react-force-graph-3d` + `three` (lazy,
client-only).

## License

MIT
