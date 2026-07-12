# RAi — Concept (RAI 2.0)

> Canonical concept document, written at GENESIS R-00. Every later R-step reads this first.
> Decisions live in the R-series log ([`decision-log.md`](decision-log.md)). The v1 concept and
> its pivot history are archived in [`archive/v1/`](archive/v1/README.md) and are not current.

---

## 1. Product truth

RAi is a universe where you compose your world with RA — the mind at the center — and it lives
as a glowing node among everyone else's.

---

## 2. The universe

One universe, two kinds of things in it:

- **RA** — the center. The platform's mind and its only fixed point.
- **Observatories** — people's worlds, arranged around RA.

Nothing else. No domains, no categories, no thematic regions, no intermediate structure. The v1
domain layer (Nexum, Keth, Solum and the rest) is demolished history; structure in the universe
comes from the worlds themselves — their colors, their positions, their liveliness — not from a
taxonomy.

**Terminology.** "Observatory" is the entity (the data model, the API, the owner's asset).
"World" is the experiential synonym (what a visitor enters, what a creator composes). The docs
use both, one meaning. Every person has at most one observatory (`userId` is unique on the
model, and that stands).

---

## 3. RA — the mind of the platform

RA is not a logo at the origin. It is the platform's active intelligence:

- **Composition is a conversation with RA.** The composer surface is not a form or a stepper;
  it is a dialogue in which RA does the assembling.
- **RA births worlds.** When a world is published, the graph fires a birth pulse — a signal
  traveling from RA to the new node. Every world visibly originates from the center.
- **RA has its own first worlds.** The two v1 demo observatories — Wawel: The Dragon's Hill and
  Signal Garden — are recast as worlds RA composed itself. They will be recomposed under the new
  content model in Phase 1 and stand as the universe's founding examples.

---

## 4. The lifecycle of a world

1. **Describe.** You tell RA what your world is about — a place, a project, an idea, anything.
2. **RA composes.** RA drafts the world inside the platform's design system: a block sequence,
   a VisualSignature, and draft copy. Not freeform code — a composition.
3. **You refine.** You iterate by conversation ("warmer", "make the opening quieter", "add a
   section about the garden") and place your own material — your images, your final words.
4. **You publish.** The world goes live at its address, and — if public — appears as a new node
   in the universe with a birth pulse from RA.

---

## 5. Visibility and address

Every world has a permanent address: `rai.app/@name`.

| Visibility | Who can see it | On the graph |
|---|---|---|
| `unpublished` | Owner only | No |
| `private` | Anyone with the URL | No |
| `public` | Anyone | Yes — a colored node |

Visibility is the owner's single publishing control. A public world's node takes its color from
the world's VisualSignature, so the graph is a field of identities, not markers.

---

## 6. Why this is different

RAi is not an AI site-builder. Builders produce isolated pages; RAi produces **inhabitants of a
shared living universe** — your page is also a node among everyone else's, discoverable by
presence rather than by feed. And composition is bounded by the platform's design system (blocks
+ VisualSignature + tokens), so every world is distinct yet coherent: no two alike, none broken,
all recognizably part of one universe.

---

## 7. What RAi is not

- **No domains.** The universe has no taxonomy layer. (Demolished from v1; see the kill-map.)
- **No feeds or social graph, for now.** Discovery is spatial — the graph — not a timeline.
  Social mechanics are a future decision, not a v2 launch feature.
- **No freeform codegen in Pro v1.** RA composes within the safe renderer. A sandboxed freeform
  tier is a separate future decision (R-DL-08), not scheduled.
- **Never custodial.** The platform shows, coordinates, verifies, and settles. It never executes
  on a user's behalf and never takes custody of funds or assets. This law carries over from v1
  unchanged.

---

## 8. Appendix — dormant v1 directions

Recorded so the vocabulary survives; dormant, with no commitments and no scheduled work:

- **Real-world / Earth mode.** Worlds pinned to physical coordinates on a map, and a virtual/real
  lifecycle for worlds that graduate into reality.
- **Idea-to-reality funding.** A non-custodial, transparent path for a community to fund the
  realization of a published idea. Any future design must satisfy the never-custodial law above.

Neither appears in the product, the schema, or the UI until a future R-series decision revives it.
