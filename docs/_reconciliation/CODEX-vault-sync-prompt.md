# CODEX PROMPT — Sync the `rai-vault` to the post-pivot repo docs

> **What this file is.** A complete, self-contained prompt for a **separate Codex run** whose job
> is to update the Obsidian **`rai-vault`** so it mirrors the reconciled RAi repo documentation.
> It was written by the DOC-SYNC-01 pass in the product repo. **Do not execute it from the repo
> conversation** — copy everything below the line into a fresh Codex session that has the vault
> open. The prompt is standalone; it does not depend on that conversation.

---

## PROMPT (give everything below to Codex)

You are Codex, operating on the Obsidian **`rai-vault`**. Your task is a **mirror-sync**: bring the
vault's execution, architecture, product, and decision notes into line with the RAi product repo's
**reconciled** documentation as of **post-PATCH-PIVOT-09** (branch `doc-sync-01-post-pivot`, or
`main` once it merges). You are mirroring existing, already-decided facts — you are **not** deciding
anything new and **not** inventing any repo changes.

### 0. Ground rules (binding)

1. **Source of truth = the repo docs, not your memory.** Read these files in the RAi repo and treat
   them as authoritative. If you cannot access the repo, ask the founder to paste them; do not guess.
   - `docs/_reconciliation/PP-01-09-reconciliation.md` — the built-vs-planned map (**primary source**;
     it contains the verified current-state snapshot: real routes, real API endpoints, real schema).
   - `docs/concept-pivot.md` — the canonical concept (universe of observatories).
   - `docs/decision-log.md` — DL-01…DL-50 with supersession annotations and the pivot reading guide.
   - `docs/architecture.md` — real API surface, repo structure, schema overview.
   - `docs/screens-spec.md` — screens with built / not-built status.
   - `docs/domain-definitions.md`, `docs/visual-reference.md`, `README.md`, `ROADMAP.md`.
2. **Only mirror. Never invent.** Do not claim any feature, endpoint, model, or route exists unless
   the repo docs say so. Where the repo marks something **not built / deferred**, the vault must say
   the same. Do not "improve" the product by adding roadmap items that aren't in the repo.
3. **Honor the vault's lazy-mirror policy (DL-007): summaries, not duplication.** Link to the repo
   docs as the canonical source; capture the *state* and the *deltas*, not verbatim copies. Keep each
   note tight.
4. **Preserve vault history.** Follow the vault's existing conventions for recording execution results
   (the way prior `ISSUE-xx` outcomes are logged). Append pivot-era entries; do not delete prior
   history — mark superseded items as superseded, mirroring how the repo decision log does it.
5. **Idempotent.** If a note is already correct, leave it. Running this twice must not create
   duplicates.
6. **Flag drift, don't silently fix the repo.** If you find a vault claim that contradicts the repo
   docs, update the vault to match the repo. If you find something in the repo docs that looks wrong
   or that the vault knows to be false, **do not change the repo** — record it in a short
   `Drift & questions` list and surface it to the founder (see §5).

### 1. The facts to mirror (verified current state, post-PP-09)

Use these as the delta target. The repo reconciliation doc is the authority if any detail differs.

**Concept.** RAi is a *universe of observatories* — art-stories about real places and virtual
worlds — explored as a one-page Terminal hosting a WebGL 3D **spherical** graph. The earlier
AI-research framing ("publish → prove → get discovered", Systems, Publications, upvotes/reputation)
is superseded at the concept level by **DL-31** and is historical.

**Web routes that exist:** `/` (Terminal), `/explore` (same Terminal), `/create` (Observatory
Studio), `/dashboard` (owner), `/about`, `/login`, `/signup`, `/privacy`, `/terms`. **Not built:**
`/observatory/:name`, `/publication/:id`, `/dashboard/{systems,publications,publish,visual,settings}`.

**API endpoints that exist (9):** `GET /api/health`; `GET|POST /api/auth/*` (Better Auth);
`GET /api/me`; `GET /api/v1/me/observatory`; `PATCH /api/v1/me/observatory` (`name` immutable);
`GET /api/v1/observatories/check/:name`; `GET /api/v1/observatories` (public list); `POST
/api/v1/observatories` (create, base fields only); `GET /api/v1/domains`. **Not built:** Systems,
Publications, Upvotes, Search, Generate (AI), Visits, Payments; no BullMQ/OpenAI/Stripe/SSE code.

**Schema.** `Observatory` (base fields; `name`/`userId` unique; **no `world` column** — DL-39
deferred) and `Domain` (7 seeded; `active`; legacy `positionX/positionY` unused by the 3D layout) are
the only models exposed via routes. `System`, `Publication`, `PublicationUpvote`, `AIGeneration`,
`CreditTransaction`, `Subscription`, `ObservatoryVisit` exist as **unused pre-pivot scaffolding**.

**Explore graph.** WebGL 3D via `react-force-graph-3d` + `three`, lazy `ssr:false`. Deterministic
**spherical** layout (RA origin; domains on a middle shell via golden-spiral; observatories on an
outer shell via cone-biased hash); visible lat/long shell; pinned/frozen positions; OrbitControls
with a clamped inside-the-sphere dolly; **true-black** dark background + paper light, live on
`data-theme`; no persistent in-scene labels (identity via Inspector/Registry). DL-43…DL-50.

**Create / Dashboard.** Studio steps World → Identity → Board → Signature → Finish; base fields
persist via `POST /api/v1/observatories`; board/photos/`world` are local drafts (no storage
provider — DL-42). Dashboard reads/edits via `me/observatory`; `name` immutable (DL-47).

**Themes.** Dual theme (dark default + light "paper", DL-32).

**Deferred / recorded:** World Mode + the `world` field (DL-34/39/48); board publishing + storage
(DL-42); community layer + idea-to-reality funding (DL-40, `concept-pivot.md` §4).

**Decisions:** DL-01…DL-50. Key supersessions: DL-13/15/16/17/21/22 → superseded/deferred by DL-31
(concept); DL-10/30/37/38 → superseded by DL-43 (WebGL 3D); DL-43 layout → DL-50 (sphere); DL-43/48
background → DL-50 (true black). See the repo decision log's reading guide for the full map.

### 2. Vault notes to update (mirror the deltas into each)

Update at least the following. If a listed note doesn't exist, create it following the vault's
existing folder/naming conventions; if the vault uses different paths, map by intent and note the
mapping in your summary.

- **`40_Execution/00_Current_State.md`** — rewrite the "current state" to the post-PP-09 reality
  (surfaces that exist, the 9 endpoints, the schema-vs-scaffolding split, deferred items). Link to
  `docs/_reconciliation/PP-01-09-reconciliation.md` as the canonical source.
- **`40_Execution/01_Next_Action.md`** (or the vault's next-action note) — set the near-term
  orientation to the repo's: storage-provider decision (unblocks board publishing), then World Mode,
  then retiring demo-seed mocks. Do **not** invent deadlines.
- **`Decision_Index`** (decision index/MOC) — ensure DL-31…DL-50 are listed with one-line summaries
  and the supersession chains from the repo reading guide. Mark superseded/amended DLs as such; do
  not renumber.
- **`30_Architecture/32_Database_Model.md`** — mirror the real `Observatory`/`Domain` fields, the
  "no `world` column yet", and the unused-scaffolding models. Remove any claim that Systems/
  Publications/etc. are live.
- **`30_Architecture/33_API_Surface.md`** — replace with the 9 real endpoints table (§1). Mark the
  old planned endpoints as not built.
- **`30_Architecture/37_Model_Implementation_Map.md`** — reconcile "planned vs implemented": map each
  Prisma model to whether it has routes/UI (only Observatory + Domain do).
- **`20_Product/*`** (concept / observatory / UI-model notes) — update the concept to the universe of
  observatories; the observatory model to the art-story + base fields + local board draft; the UI
  model to the Terminal (Registry / 3D-sphere Topology / Inspector / Activity), the Studio, and the
  Dashboard. Note the single-world UI (DL-48) and dual theme (DL-32).
- **`03_MOC_*`** (navigation/MOCs) — fix any links or descriptions that still describe the AI-research
  product, the SVG topology, dark-only, or the unbuilt screens.

### 3. Execution log for the pivot era (PP-01 … PP-09)

Record the pivot patches the way the vault already records `ISSUE-xx` outcomes — **summaries, per
DL-007**, one compact entry per patch, linked to the repo decisions. Suggested one-liners (confirm
against `docs/_reconciliation/PP-01-09-reconciliation.md` §1 before writing):

- PP-01 Living Terminal + dual theme + mock art-stories (DL-31…34)
- PP-02 Explore terminal + first-class observatory nodes; starfield removed (DL-35…37)
- PP-03 Living Crystal Graph (DL-38…40)
- PP-04 Observatory Studio + `POST /api/v1/observatories` + glass primitives (DL-41/42)
- PP-05 WebGL 3D graph (DL-43…45)
- PP-06 real observatories in discovery + owner Dashboard (DL-46/47)
- PP-07 single-world UI + theme-literal scene + no labels (DL-48)
- PP-08 Observatory Story shared renderer (DL-49)
- PP-09 spherical universe + true-black dark (DL-50)

Note PP-09 was committed but may not be merged to `main` yet — check the repo before asserting it as
"merged"; describe it as "committed / landing" if unmerged.

### 4. Self-verify checklist (run before finishing)

- [ ] Every vault claim about a route/endpoint/model matches §1 (and the repo reconciliation doc).
- [ ] No vault note presents Systems, Publications, upvotes, AI generation, payments, the public
      `/observatory/:name`/`/publication/:id` pages, or Settings as **built**.
- [ ] `Current_State`, `Next_Action`, `Database_Model`, `API_Surface`,
      `Model_Implementation_Map`, the `20_Product/*` notes, `Decision_Index`, and the `03_MOC_*`
      navigation are all updated and internally consistent.
- [ ] Decisions DL-31…DL-50 appear in the decision index with supersession chains; nothing is
      renumbered or deleted.
- [ ] The pivot execution entries (PP-01…PP-09) exist as summaries (DL-007), linked to the repo, not
      duplicated verbatim.
- [ ] Dual theme (DL-32), single-world UI (DL-48), no `world` column, and the spherical 3D graph
      (DL-50) are reflected wherever relevant.
- [ ] No new repo changes were invented; the vault only mirrors the reconciled docs.
- [ ] Running this sync again would make no further changes (idempotent).

### 5. Drift & questions (report back to the founder)

Maintain a short list of anything you could not reconcile, plus these known open questions carried
from the repo reconciliation doc (`§5 Open questions`) — confirm or resolve with the founder rather
than guessing:

- Whether the deployed database carries the seed's `test-observatory-1/2/3` (they default to
  `publicMode: true` and would then show in the public list + graph).
- Whether the legacy `Domain.positionX/positionY` and the unused pre-pivot models
  (System/Publication/…) should be pruned in a future migration or kept.
- The final name for "World Mode" (placeholder only — do not invent one).
- Any vault note that still asserts the AI-research product as current and that you were unsure how to
  map.

Deliver: the list of vault files changed, a one-paragraph summary of the sync, and the Drift &
questions list. Do not modify the RAi repo.
