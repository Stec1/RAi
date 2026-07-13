# RAi — Decision Log (R-series)

> This log starts at GENESIS. It is the only authoritative decision record for RAI 2.0.
> The v1 log (DL-01…DL-50) is archived and frozen at
> [`archive/v1/decision-log.md`](archive/v1/decision-log.md); it remains historical context and
> nothing in it binds v2 unless restated here.
> Entries are append-only and never renumbered. A superseded entry stays in place with a
> `> Superseded by R-DL-XX` note.

---

## R-DL-01 — The GENESIS reset

**Decision:** RAi undergoes a full product rewrite (RAI 2.0). All v1 documentation is archived to
`docs/archive/v1/`; this R-series log is now the only authoritative decision record.

**Why:**
- Nine pivot patches stretched v1 far from its original docs; incremental patching had reached
  the point where the concept itself, not the surfaces, needed restating.
- A single, freshly written canon is cheaper to keep true than a reconciled pile of eras.

---

## R-DL-02 — One universe: RA + Observatories

**Decision:** The universe contains exactly RA (the center) and Observatories (people's worlds).
Domains are removed entirely — schema, seed, API, and UI. Demolition is scheduled in the kill-map:
data and API at R-01, remaining UI/layout at R-03.

**Why:**
- Domains were v1 taxonomy that carried no user value: worlds do not need categories to exist.
- Structure now comes from the worlds themselves (color, position, life), which scales with
  content instead of with an editorial layer.

---

## R-DL-03 — RA is the mind of the platform

**Decision:** RA is the platform's active intelligence, not a decorative hub. The composer is a
conversation with RA. Publishing fires a birth pulse from RA to the new node. The two v1 demo
observatories (Wawel, Signal Garden) become RA's own first worlds, to be recomposed under the new
content model in Phase 1.

**Why:**
- The product's differentiation is that the center composes; making RA the author of the first
  worlds makes that claim concrete from day one.
- The birth pulse ties creation to the graph visually — every world demonstrably originates at RA.

---

## R-DL-04 — Observatory = a person's world

**Decision:** An Observatory is one person's world. One per user: the existing
`Observatory.userId @unique` constraint stands. Terminology follows `concept.md` — "Observatory"
is the entity, "world" the experiential synonym.

**Why:**
- One-per-person keeps the universe legible: a node is a person's presence, not one of their
  projects.
- Reusing the existing constraint means no data-model churn for the rule that matters most.

---

## R-DL-05 — Visibility model

**Decision:** Worlds have a `visibility` enum: `unpublished` (owner only), `private` (URL only,
off-graph), `public` (URL + node on the graph). Every world gets a permanent address
`rai.app/@name`.

**Why:**
- One control answers the only publishing question an owner has: who can see this.
- The URL exists at every visibility level, so sharing is a visibility change, not a migration.

---

## R-DL-06 — Server-side content + R2 media

**Decision:** World content (the block sequence) persists server-side as JSONB on the Observatory
(R-01). Media lives on Cloudflare R2, uploaded via presigned URLs (R-02). The localStorage-draft
era ends.

**Why:**
- v1's localStorage board was an honest stopgap that blocked every real feature: no cross-device
  drafts, no public pages with images, no composer output that survives.
- JSONB matches the block model's shape and needs no separate content service at this scale.

---

## R-DL-07 — RA composes within the system

**Decision:** The LLM is a composition assistant bounded by the platform's design system — the
block model + VisualSignature — never freeform codegen. Calls go to the Anthropic API server-side
only, with streaming responses; usage is metered through the retained credits substrate
(`AIGeneration`, `CreditTransaction`, `creditsBalance`).

**Why:**
- Bounded composition guarantees every world renders correctly, stays theme-compatible, and looks
  like RAi; freeform code guarantees none of that.
- Server-side keys plus per-generation metering give cost control from the first request.

---

## R-DL-08 — Pro staging

**Decision:** Free tier = the guided composer with generation limits. Pro v1 = deeper freedom
within the safe renderer (more generations, richer composition options). Pro v2 — sandboxed
freeform composition — is a separate future decision, not scheduled.

**Why:**
- The free/pro line must exist at launch for cost safety, but the tempting third tier (freeform)
  carries sandboxing and review costs that deserve their own decision, not a rider on this one.

---

## R-DL-09 — Migration policy and no broken windows

**Decision:** The v1 migration freeze is lifted. Each phase ships at most one consolidated Prisma
migration. Every R-step leaves the app deployable, using the interim adaptations specified in the
kill-map (for example, hash-based node placement between R-01 and R-03).

**Why:**
- Consolidated migrations keep the history readable and the rollback story simple.
- A rewrite that breaks the deployed app mid-sequence would force parallel branches; interim
  adaptations are cheaper.

---

## R-DL-10 — Node identity

**Decision:** A world's graph node takes its color from the world's VisualSignature primary color
(chosen by the owner during composition). Node positions are deterministic and domain-independent:
interim name-hash placement at R-01, full spatial model at R-03/R-04.

**Why:**
- Color-from-signature makes the graph a field of self-chosen identities with zero extra data.
- Determinism (carried over from the v1 sphere work) keeps the universe stable across sessions
  and independent of the removed domain layer.

---

## R-DL-11 — Chassis kept

**Decision:** The technical chassis is retained: pnpm monorepo, Fastify + Prisma + Postgres +
Redis, Better Auth (session cookies + same-origin proxy), Vercel + Railway,
react-force-graph-3d + three (lazy, `ssr:false`), CSS Modules + the token system + dual theme.
ObservatoryStory and VisualSignature evolve; they do not restart.

**Why:**
- The chassis is the part of v1 that works; the rewrite is conceptual, not infrastructural.
- ObservatoryStory is already the single shared world renderer — exactly what the composer needs
  to target.

---

## R-DL-12 — Legacy table disposition

**Decision:** `System`, `Publication`, `PublicationUpvote`, and `ObservatoryVisit` are slated for
drop at R-10, pending final founder confirmation (open question OQ-05). `AIGeneration`,
`CreditTransaction`, `Subscription`, `User.planTier`, and `User.creditsBalance` are retained as
the billing/AI substrate.

**Why:**
- The legacy four are v1 scaffolding with no routes or UI; dropping them at the end avoids
  carrying dead weight into 2.0 while leaving time to confirm nothing in production references
  them.
- The billing/AI substrate is exactly what the composer (R-06) and the gate (R-09) will meter
  against — rebuilding it would be waste.

---

## R-DL-13 — Design gates

**Decision:** R-03 (the meta-graph) and R-07 (the composer surface) are each preceded by a
founder-approved Claude Design round (round A and round B respectively). Implementation follows
the approved reference, not ad-hoc taste.

**Why:**
- These are the two surfaces that define how RAI 2.0 feels; v1 showed that iterating visual
  direction inside implementation patches burns cycles (three graph aesthetics in nine patches).
- A gate makes "what we are building" founder-approved before the expensive step starts.

---

## R-DL-14 — publicMode → visibility mapping (migration #1)

**Decision:** Migration #1 maps existing rows `publicMode=true → public` and
`publicMode=false → private` (resolving OQ-06 per the R-01 prompt), then drops the column.
Rows becoming `public` get `publishedAt` backfilled with their `createdAt` (they were already
publicly visible — their effective first publish was creation); `updatedAt` is likewise
backfilled with `createdAt` and its temporary SQL default is dropped after the backfill.

**Why:**
- `true → public` preserves what owners already chose to show; `false → private` is the closest
  semantic (hidden from discovery but reachable), and nothing silently disappears.
- Backfilling with `createdAt` keeps R-05 freshness honest instead of stamping migration time.

---

## R-DL-15 — `/@name` via a root `[handle]` dynamic segment

**Decision:** The public world route is `apps/web/src/app/[handle]/page.tsx` — a root dynamic
segment that requires the decoded segment to start with `@` and 404s otherwise. It is a server
component: it fetches the world from the API origin (`API_PROXY_ORIGIN`, the same upstream the
`/api/*` proxy uses) with the request cookies forwarded, wrapped in React `cache()` so
`generateMetadata` and the page share one request. `force-dynamic` — the page always reflects
current visibility and content.

**Why:**
- An `@folder` is a Next.js parallel-route slot, not a path segment; a guarded dynamic segment
  is the only way to own `rai.app/@name` while every static route keeps precedence.
- Server-side rendering gives real metadata and lets the owner view an `unpublished` world
  through the same visibility guard (cookie-forwarded), with 404 for everyone else.

---

## R-DL-16 — pendingMedia: image blocks before media exists

**Decision:** Until R-02, an image block persists as `{ type:'image', caption?,
pendingMedia:true }` — no binary, no URL. The renderer presents it as the framed placeholder
plate with its caption; the studio/dashboard upload paths set the flag automatically.

**Why:**
- Stories can be composed and persisted NOW without inventing a throwaway storage path; R-02
  replaces the flag with real object keys in place.
- An honest placeholder is composed, not broken — the story's rhythm survives the wait.

---

## R-DL-17 — RA's first worlds are owned by system users

**Decision:** `wawel-dragons-hill` and `signal-garden` are real DB rows owned by two system
users (`wawel@system.rai.internal`, `signal-garden@system.rai.internal`, both named "RA").
The users are unloginable by construction: NO credential Account row is ever created (Better
Auth email sign-in has nothing to verify against), which is strictly stronger than the
random-unusable-hash suggested in the R-01 prompt — reported as a deliberate deviation.
The seed upserts by id/name, never touches real user rows, and never resets `publishedAt`.

**Why:**
- Real rows mean the graph, the by-name endpoint, and the world pages run on one code path —
  no demo-mock special-casing anywhere (the mock module is deleted).
- No-account is unloginable without imitating Better Auth's hash format, which could rot.

---

## R-DL-18 — Content validation caps

**Decision:** Server-side content validation (shared by POST and PATCH): ≤100 blocks, ≤200KB
total JSON measured on the CLEANED array, per-string caps (text/caption/href/label 5000 chars;
id/variant 64), type whitelist, booleans only for `fullBleed`/`pendingMedia`, unknown keys
stripped, empty strings dropped. The cleaned array is what persists. `href` is length-capped
but not protocol-validated — the renderer treats non-http(s) links as inert labels.

**Why:**
- Caps bound the JSONB column and the graph-page payloads before any composer exists to
  generate content at scale (R-06 will lean on the same validator).
- Cleaning (rather than rejecting unknown keys) keeps old drafts and future additive hints
  compatible in both directions.

---

## R-DL-19 — Interim node placement: hash-picked golden-spiral slot

**Decision:** Until the R-03 spatial model, a world's node position is `fibDir(floor(u·997),
997) · R_SHELL` where `u` is the FNV-1a hash of its `name` — a slot on a 997-point
golden-spiral lattice on the outer shell. Node color is the world's VisualSignature primary
with a neutral slate fallback; a thin RA→world tether is the only edge type.

**Why:**
- Position depends only on the world's own name: joining worlds never reshuffle the sky, and
  the same data lays out identically every load (R-DL-10).
- 997 is prime and ≫ MVP world counts, spreading hash residues with negligible collision odds;
  a collision merely overlaps two nodes until R-03's real spatial model lands.
