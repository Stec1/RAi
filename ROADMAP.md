# RAi — Product Roadmap

> Living document. Not a dated schedule — a system of orientations.

**Last updated:** 2026-07-09 (post-PATCH-PIVOT-09; reconciled in DOC-SYNC-01).

---

## Current Phase

**Post-pivot consolidation.** RAi has completed its concept pivot — from a "publish → prove → get
discovered" AI-research platform to a **universe of observatories** — across nine patches,
PP-01…PP-09. The universe is a live WebGL 3D **sphere**; creators can build an observatory in the
Studio and manage it in the Dashboard. This phase reconciles the documentation to the built product
and lines up the next tracks.

- Canonical concept: [`docs/concept-pivot.md`](docs/concept-pivot.md)
- Built reality: [`docs/_reconciliation/PP-01-09-reconciliation.md`](docs/_reconciliation/PP-01-09-reconciliation.md)

---

## Shipped — the pivot (PP-01 … PP-09)

| Patch | Delivered | Decisions |
|---|---|---|
| PP-01 | Living Terminal on `/` + `/explore`; dual theme; two mock art-stories; World Mode deferred | DL-31…34 |
| PP-02 | Explore terminal (Registry / Topology / Inspector / Activity); observatories as first-class nodes; starfield removed | DL-35…37 |
| PP-03 | Living Crystal Graph (luminous hub, identity orbs, curved gradient edges, depth rings) | DL-38…40 |
| PP-04 | Observatory Studio; `POST /api/v1/observatories`; glass primitives | DL-41/42 |
| PP-05 | Real WebGL 3D graph (`react-force-graph-3d` + Three.js) | DL-43…45 |
| PP-06 | Real observatories in discovery (`GET /api/v1/observatories`); owner Dashboard (`me/observatory`) | DL-46/47 |
| PP-07 | Single-world UI; theme-literal scene; no in-scene labels | DL-48 |
| PP-08 | Observatory Story shared renderer | DL-49 |
| PP-09 | Spherical universe layout; true-black dark background | DL-50 |

---

## Now true (state of the product)

- **Explore:** WebGL 3D spherical universe; dark + light themes; Registry / Inspector / Activity.
- **Create:** Observatory Studio — base fields persist; board / photos / `world` stay local.
- **Dashboard:** view + edit the observatory (`name` immutable).
- **API:** nine endpoints — health, auth, `me`, observatories (check / list / create), domains.
- **Seed:** 7 domains (3 active), plus test users/observatories.

## Deferred / recorded (not built)

- **Board publishing + storage** — blocked on a storage-provider decision (DL-42). Unblocks durable
  boards and a public observatory page.
- **World Mode** — real-world map + virtual↔real toggle; the `world` field is a hidden forward flag
  today (DL-34 / DL-39 / DL-48).
- **Community layer** — comments, contestation, community verification, ambassador monetization
  (`docs/concept-pivot.md` §4); idea-to-reality funding is direction-only (DL-40).
- **Earlier AI-research surfaces** — Systems, Publications, AI formatting, Upvotes / Reputation
  engine, payments. Some models remain in the schema as unused scaffolding.
- **Retire demo-seed mocks** — once enough real observatories exist (DL-46).

---

## Orientation gates

| Gate | Question |
|---|---|
| Storage decision | Do boards/photos need to be durable before more creators arrive? |
| World Mode | Has the virtual universe earned a real-world map? |
| Cold start | Are there enough real observatories to retire the demo-seed mocks? |

---

## What success looks like

- A visitor lands on `/`, reads the universe as a living instrument, opens an observatory's
  art-story, and understands what RAi is within seconds.
- A creator builds an observatory in the Studio and sees it appear as a node in the universe.
- The documentation never claims more than the product actually does.

---

## Review cadence

- **Per patch:** record the decision(s) in `docs/decision-log.md`; keep `screens-spec.md` /
  `architecture.md` in step with any new surface or endpoint.
- **Periodically:** re-run the reconciliation check (docs vs. code) so drift never accumulates
  the way it did before DOC-SYNC-01.
