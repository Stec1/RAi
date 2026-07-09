# RAI — Concept Pivot: A Universe of Observatories

> **Canonical concept document.** Source of truth for the product concept.
> The pivot began in PATCH-PIVOT-01 and has been carried through PATCH-PIVOT-09;
> this document is maintained as the concept spine across that whole era. It
> supersedes concept-level statements in older docs where they conflict.
> Founding decisions: DL-31 (pivot), DL-32 (terminal + dual theme),
> DL-33 (living motion), DL-34 (World Mode deferred). Later shape:
> DL-43/DL-50 (WebGL 3D spherical topology), DL-48 (single-world UI).
> For the current *built* reality see
> [`_reconciliation/PP-01-09-reconciliation.md`](_reconciliation/PP-01-09-reconciliation.md).

---

## 1. Problem statement

Knowledge about places is scattered across social posts, map reviews, and the memories of guides. There is no space where the story of a place lives as one coherent, art-directed presentation — pinned to the world, open to contribution, and verified by its community. RAI is that space.

---

## 2. The two worlds

RAI has two modes of presence. One ships now; one is deferred.

**The virtual universe (shipped).** The living graph: RA at the center, the seven Domains as thematic regions around it, and Observatories settling near the domains they belong to. It is rendered as the RAI Terminal — a one-page instrument with a header bar, the universe canvas, and a status line. As of PATCH-PIVOT-05…09 the canvas is a real **WebGL 3D graph** shaped as a **bounded sphere** — RA at the origin, domains on a middle shell, observatories on an outer shell, inside a visible lat/long boundary (DL-43/DL-50). The universe is calm but alive: the RA node vibrates, bloom lights the nodes, and it reads in both dark (true black) and light (paper) themes. This is where stories are discovered before any map exists.

**World Mode (deferred).** An interactive real-world map where observatories are pinned to actual coordinates — a castle on its hill, a restaurant on its street. "World Mode" is a working placeholder name; the final name is undecided. No part of World Mode ships in this patch: no map surface, no mode switcher. It arrives as a dedicated future patch (DL-34).

**The lifecycle between the worlds (future scope — DL-39).** The two worlds are two halves of one lifecycle: a virtual observatory presents an idea before it exists; a real observatory is tied to an existing place; an idea can graduate from virtual to real when it is realized. Observatories will carry a `world` field (`virtual` | `real`). The Explore virtual/real toggle, the Earth map, and the database column are all future patches — recorded now so designs converge on one vocabulary.

> **Current UI is single-world (DL-48).** Until World Mode ships, the virtual/real
> distinction is not shown anywhere: every observatory presents simply as an
> observatory in the one existing universe. `world` (and the `real-place` /
> `virtual-world` kinds) are retained in the data model, types, and the studio draft
> as forward-looking flags only — never surfaced. The `world` database column is
> still deferred (there is no `world` column in the schema yet).

---

## 3. Observatory, redefined

An Observatory is a person's place in the RAI universe: an art-story about something real or something virtual.

- **Real places:** a castle, a restaurant, a street, an event, a business — anything with a story worth telling well.
- **Virtual worlds:** generative art, imagined spaces, any format.

The format is open: narrative, gallery, graph, presentation room — and 3D in the future. What makes it an Observatory is not the medium but the stance: one coherent, art-directed presentation of a subject, published by someone who cares about it, open to contribution, and accountable to its community.

---

## 4. Community layer (future — documentation only)

The community layer is future scope. It appears in documentation only and never in UI until its own patches land:

- **Comments** on observatories and their sections.
- **Contestation** — Wikipedia-style challenges to claims a story makes, with visible resolution.
- **DAO-style resolution** — community voting settles contested claims; in UI copy this is always described as "community-verified", never with governance jargon.
- **Ambassador monetization** — the people who keep a story alive can offer paid, story-adjacent services: a booked guided tour, an exclusive recipe, a walkthrough.

DL-25 governs all of it: RAI shows stories, coordinates community verification, settles reputation — and never executes anything itself.

**Idea-to-reality funding (future direction — DL-40, recorded only).** A future, non-custodial, transparent funding path may let a community fund the realization of a published idea, controlled by protocol such that funds are never routed to a founder's personal wallet. DL-25-aligned by construction; not scoped, not designed, not built — open legal and technical questions live in their own track.

---

## 5. What is explicitly NOT changing

- **The 7 Domains** remain the thematic structure of the universe — names, colors, active/coming-soon states. (Their seed 2D `positionX/positionY` are legacy from the SVG era and are no longer used by the 3D spherical layout, which computes its own positions.)
- **The stack**: Next.js 14 + Fastify + Prisma + the same-origin API proxy. *(Amended in PATCH-PIVOT-05: one scoped client-only dependency, `react-force-graph-3d`, was added for the Explore WebGL graph on the pre-existing `three` — DL-43. No other new dependencies.)*
- **DL-25** remains binding, reinterpreted for stories rather than replaced.
- **Auth contracts**: session cookies, post-auth redirect rules (DL-26), TopBar roles (DL-28), public access rules per screen.
- **`/explore` interaction** *(amended in PATCH-PIVOT-05):* the SVG CTM pan/zoom was retired with the SVG renderer; interaction is now 3D **OrbitControls** (orbit + pan + a clamped inside-the-sphere dolly, DL-43/DL-50).

---

## 6. Rollout

1. **PATCH-PIVOT-01:** the pivot documented; the RAI Terminal on `/` and `/explore`; the living universe (motion, dual theme); two mock observatories with full-screen art-story overlays; all screen copy rewritten to the new concept.
2. **PATCH-PIVOT-02:** Explore as a living terminal — Registry rail, framed Topology panel, docked Inspector, activity strip; Observatories first-class on the topology (DL-35/DL-36); living-instrument motion replaces the starfield (DL-33 amended, DL-37).
3. **PATCH-PIVOT-03:** the Living Crystal Graph — luminous topology overhaul: faceted warm-gold crystal hub, glowing identity orbs, curved gradient edges, depth rings, real pill view-controls (DL-37 amended, DL-38).
4. **PATCH-PIVOT-04:** the Observatory Studio — `/create` becomes a multi-step creation environment with live previews; `POST /api/v1/observatories` persists the base observatory (DL-41/DL-42); board, photos, and the `world` choice stay local until the content model and storage land.
5. **PATCH-PIVOT-05:** the topology becomes a real WebGL 3D graph (react-force-graph-3d + Three.js, lazy `ssr:false`) — faceted gold RA hub, 7 identity orbs, observatories in parent-domain color (DL-43/DL-44/DL-45).
6. **PATCH-PIVOT-06:** graph polish + real observatories in discovery (`GET /api/v1/observatories`, real-replaces-mock merge) + the owner Dashboard with `me/observatory` read/update (DL-46/DL-47).
7. **PATCH-PIVOT-07:** single-world UI (virtual/real tags hidden, `world` retained as a forward flag) + the scene background follows the theme literally + persistent in-scene node labels removed (DL-48).
8. **PATCH-PIVOT-08:** an observatory's board is presented as a directed art-story through one shared renderer (`ObservatoryStory`) used by both the Explore overlay and the studio live preview (DL-49).
9. **PATCH-PIVOT-09:** the universe becomes a bounded **sphere** — deterministic golden-spiral/cone layout on middle+outer shells, a visible lat/long shell, orbit controls with a clamped inside-the-sphere dolly, and a true-black dark background (DL-50).
10. **World Mode (future):** the real-world map and the mode switcher, as a dedicated patch (with the virtual/real lifecycle, DL-39).
11. **Community mechanics (future):** comments, contestation, community verification, ambassador monetization — in their own sequence, after the universe holds real observatories.
