# RAi — GENESIS Roadmap (RAI 2.0)

> The execution plan for the rewrite. One R-step = one session = one reviewable branch.
> Statuses: `planned` · `in progress` · `done`. Scope details live in
> [`product-spec.md`](product-spec.md) and [`kill-map.md`](kill-map.md); decisions in
> [`decision-log.md`](decision-log.md).

| Phase | Step | Scope | Status |
|---|---|---|---|
| **0 — GROUND ZERO** | **R-00** | New canonical docs (concept, spec, architecture, R-series log, roadmap, kill-map, open questions); v1 docs archived. No code. | in progress |
| **1 — ONE UNIVERSE** | **R-01** | The world model: `visibility` enum, content blocks as JSONB, domain break (schema/seed/API/shared + interim graph adaptation), `/@name` route, API v2 core (world CRUD + publish/visibility + public fetch + graph list), consolidated migration #1. | planned |
| | **R-02** | Media: Cloudflare R2, presigned uploads, real image blocks in content + renderer. | planned |
| **2 — THE META-GRAPH** | **R-03** | Full-screen meta-graph + minimal HUD (thin top strip, floating selected-node card, bottom controls) + new domain-independent spatial model. Follows founder-approved Design round A (R-DL-13). Terminal side columns demolished. | planned |
| | **R-04** | Depth: level-of-detail, color constellations, search + fly-to, camera choreography, instancing/perf for growing node counts. | planned |
| | **R-05** | Life: freshness glow, the birth pulse (RA → new node), ambient flows — driven by real data only. | planned |
| **3 — THE COMPOSER** | **R-06** | RA backend: server-side Anthropic API, streaming, credit metering into `AIGeneration`/`CreditTransaction`, cost guards. | planned |
| | **R-07** | Composer surface: conversation with RA + live world preview + manual image/text placement + publish. Follows founder-approved Design round B (R-DL-13). Replaces the v1 stepper studio. | planned |
| | **R-08** | World page mastery: `/@name` polish, honest visibility states, share/OG images, simplified dashboard. | planned |
| **4 — THE GATE** | **R-09** | Stripe + free/pro gating: generation limits on free, Pro checkout, entitlements. | planned |
| **5 — LIFTOFF** | **R-10** | Onboarding, new landing + full copy rewrite, perf/mobile audit, legacy-table drop (pending OQ-05), final doc sync. | planned |

## Phase gates

- **Design round A** before R-03; **Design round B** before R-07 (R-DL-13).
- One consolidated Prisma migration per phase; every step leaves the app deployable (R-DL-09).
- Founder inputs required per step are tracked in [`open-questions.md`](open-questions.md).
