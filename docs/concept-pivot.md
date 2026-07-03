# RAI — Concept Pivot: A Universe of Observatories

> Canonical concept document for the founder-approved pivot executed in
> PATCH-PIVOT-01. Supersedes concept-level statements in older docs where
> they conflict. Decisions: DL-31 (pivot), DL-32 (terminal + dual theme),
> DL-33 (living motion), DL-34 (World Mode deferred).

---

## 1. Problem statement

Knowledge about places is scattered across social posts, map reviews, and the memories of guides. There is no space where the story of a place lives as one coherent, art-directed presentation — pinned to the world, open to contribution, and verified by its community. RAI is that space.

---

## 2. The two worlds

RAI has two modes of presence. One ships now; one is deferred.

**The virtual universe (this patch).** The living graph: RA at the center, the seven Domains as thematic regions around it, and Observatories settling near the domains they belong to. It is rendered as the RAI Terminal — a one-page instrument with a header bar, the universe canvas, and a status line. The universe is calm but alive: the RA halo pulses, domains breathe, signals travel the connection lines. This is where stories are discovered before any map exists.

**World Mode (deferred).** An interactive real-world map where observatories are pinned to actual coordinates — a castle on its hill, a restaurant on its street. "World Mode" is a working placeholder name; the final name is undecided. No part of World Mode ships in this patch: no map surface, no mode switcher. It arrives as a dedicated future patch (DL-34).

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

---

## 5. What is explicitly NOT changing

- **The 7 Domains** remain the thematic structure of the universe — names, colors, seed positions, active/coming-soon states.
- **The stack**: Next.js 14 + Fastify + Prisma + the same-origin API proxy. No new dependencies.
- **DL-25** remains binding, reinterpreted for stories rather than replaced.
- **Auth contracts**: session cookies, post-auth redirect rules (DL-26), TopBar roles (DL-28), public access rules per screen.
- **`/explore` interaction hardening**: the pan/zoom implementation is preserved intact.

---

## 6. Rollout

1. **PATCH-PIVOT-01 (this patch):** the pivot documented; the RAI Terminal on `/` and `/explore`; the living universe (motion, dual theme); two mock observatories with full-screen art-story overlays; all screen copy rewritten to the new concept.
2. **World Mode:** the real-world map and the mode switcher, as a dedicated patch.
3. **Community mechanics:** comments, contestation, community verification, ambassador monetization — in their own sequence, after the universe holds real observatories.
