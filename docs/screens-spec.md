# RAi — Screens Specification

> **PIVOT NOTE (PATCH-PIVOT-01 … 09):** RAI is a universe of observatories — art-stories
> about real places and virtual worlds. `/` and `/explore` both render the one-page
> RAI Terminal hosting the living universe (now a WebGL 3D sphere). See
> [`concept-pivot.md`](concept-pivot.md) and DL-31…DL-50.
>
> **This spec has been reconciled to the built product (DOC-SYNC-01).** Several screens in
> the original MVP map are **not built** and are marked so below — they describe the earlier
> AI-research plan (Systems, Publications, Publish, Visual-Signature AI, the public
> `/observatory/:name` and `/publication/:id` pages, and Settings). Routes, auth rules, and
> post-auth routing remain canonical. For the exact built reality see
> [`_reconciliation/PP-01-09-reconciliation.md`](_reconciliation/PP-01-09-reconciliation.md).

> Short spec for every MVP screen.
> Describes purpose, primary components, and key user actions.
> This is the app map. Not a design spec — a structural reference.

---

## Screen List

| # | Screen | Route | Auth required | Status |
|---|---|---|---|---|
| 1 | Start Page (RAI Terminal) | `/` | No | ✅ Built |
| 2 | About | `/about` | No | ✅ Built |
| 3 | Login | `/login` | No | ✅ Built |
| 4 | Get Started | `/signup` | No | ✅ Built |
| 5 | Explore (RAI Terminal) | `/explore` | No (browse) | ✅ Built |
| 6 | Create Observatory (Studio) | `/create` | Yes | ✅ Built |
| 7 | Dashboard (owner) | `/dashboard` | Yes | ✅ Built (baseline) |
| 8 | Systems Management | `/dashboard/systems` | Yes | ⛔ Not built (deferred) |
| 9 | Publications Management | `/dashboard/publications` | Yes | ⛔ Not built (deferred) |
| 10 | Publish | `/dashboard/publish` | Yes | ⛔ Not built (deferred) |
| 11 | Visual Signature (AI) | `/dashboard/visual` | Yes | ⛔ Not built (deferred) |
| 12 | Observatory Public Page | `/observatory/:name` | No | ⛔ Not built (deferred) |
| 13 | Publication Page | `/publication/:id` | No | ⛔ Not built (deferred) |
| 14 | Settings | `/dashboard/settings` | Yes | ⛔ Not built (deferred) |
| 15 | Privacy Policy | `/privacy` | No | ✅ Built |
| 16 | Terms of Service | `/terms` | No | ✅ Built |

> **Note on "upvote".** Screen 5 historically said "Yes (upvote)" for auth. There is no upvote
> or publication surface in the built product; browsing `/explore` needs no auth, and there is
> nothing to upvote. The auth column above reflects the built reality.

> **Note on the public observatory page.** An observatory's art-story is currently presented
> *inside the Terminal* as a full-screen overlay (DL-31/DL-49), not at a public `/observatory/:name`
> route. That standalone public route is deferred until board publishing + storage land (DL-42/DL-49).

---

## Screen 1 — Start Page (RAI Terminal)

**Route:** `/`
**Auth required:** No

**Purpose:**
First public contact with RAi. `/` renders the one-page **RAI Terminal** — the living universe — for every visitor (DL-31/DL-32). The old scroll-narrative marketing landing was retired in PATCH-PIVOT-01; its narrative copy lives in `/about`. Authenticated users are never redirected away from `/`.

**Primary components:**
- Terminal header (DL-28 roles preserved): RAi logo → `/`, auth-aware nav, theme toggle (dark ⇄ light paper, DL-32).
- The universe canvas: a WebGL 3D spherical topology (RA at center, 7 domains, observatories on the shell — DL-43/DL-50).
- Registry rail (domains + observatories), a docked Inspector for the selected entity (with the auth-aware CTA and `Open art-story`), and an Activity strip (DL-36).
- Status line / live readouts computed from fetched data.

**Key actions:**
- Select a node or a Registry item → Inspector updates.
- `Open art-story` on an observatory → full-screen story overlay (DL-49).
- Click "Get Started" → `/signup`; "Log in" → `/login`; RAi logo → `/` (DL-28).
- Toggle theme (dark ⇄ light).

---

## Screen 2 — About

**Route:** `/about`
**Auth required:** No

**Purpose:**
Full readable description of the RAi platform. Informational space for users who want to understand the product in depth before registering.

**Primary components:**
- Top bar follows DL-28 (logo → `/`).
- Full description of RAi as a universe of observatories: what an observatory is (an art-story about a real place or a virtual world), the 7 Domains, and how the universe is discovered
- Product vision and narrative (the concept lives in [`concept-pivot.md`](concept-pivot.md))
- Back navigation to the Start Page (the Terminal)

**Key actions:**
- Read
- Click "Get Started" → `/signup`

---

## Screen 3 — Login

**Route:** `/login`
**Auth required:** No

**Purpose:**
Authentication screen for returning users.

**Primary components:**
- Premium dark editorial background
- Centered card:
  - RAi logo
  - Email + password fields
  - "Log in" button
  - Google OAuth button
  - Link to `/signup`

**Key actions:**
- Submit email/password → authenticate → redirect to `/dashboard` (if Observatory exists) or `/explore` (if not)
- Google OAuth → authenticate → same redirect logic
- Click "Get Started" → `/signup`

---

## Screen 4 — Get Started

**Route:** `/signup`
**Auth required:** No

**Purpose:**
New user registration. After successful registration, redirect by Observatory presence: `/dashboard` if Observatory exists, `/explore` if not.

**Primary components:**
- Same card layout as Login
- Email + password fields (with confirmation)
- Google OAuth button
- Display name field (optional, editable later)
- Link back to `/login`

**Key actions:**
- Register → if no Observatory → `/explore`
- Register → if has Observatory (edge case) → `/dashboard`
- Google OAuth → same redirect logic

---


### Post-auth routing (canonical)
- Unauthenticated users can browse `/explore`
- Unauthenticated CTAs on `/explore` route to `/signup` or `/login`
- Successful login/signup with Observatory → `/dashboard`
- Successful login/signup without Observatory → `/explore`
- Authenticated users without Observatory use `/explore` CTA to enter `/create`

## Screen 5 — Explore (RAI Terminal)

**Route:** `/explore`
**Auth required:** No (browsing)

**Purpose:**
The discovery surface. `/explore` renders the **same RAI Terminal** as `/` (both routes are kept so redirects and TopBar links keep working). It is an information terminal, not a full-bleed canvas (DL-36).

**Primary components (DL-36):**
- **Command strip / header:** wordmark, context label, live readouts from fetched data, theme toggle (dark ⇄ light paper, DL-32), DL-28 auth-aware nav. The primary CTA lives in the Inspector, not the header (DL-28).
- **Registry rail:** a named list of the 7 domains and the observatories, each selectable into the Inspector. Identity lives here and in the Inspector — there are **no persistent labels in the 3D scene** (DL-48).
- **Topology panel:** the WebGL 3D graph — a bounded **sphere** with RA at the origin, 7 domain nodes on a middle shell, observatories on the outer shell (DL-43/DL-44/DL-45/DL-50). All 7 domains always render; `active` is a visual state (DL-44). Quiet pill view-controls (Reset / Fit / Focus RA / dim-inactive filter). Orbit + pan + a clamped inside-the-sphere dolly.
- **Inspector (docked):** details for the selected entity (RA / domain / observatory), the auth-aware CTA, and the `Open art-story` entry for observatories.
- **Activity strip:** mock events until a real feed exists.
- Below ~1024px the Registry / Inspector / Activity collapse into a tabbed bottom sheet under the topology panel.

**Data:**
- Domains from `GET /api/v1/domains`; public observatories from `GET /api/v1/observatories` (DL-46), merged with two demo-seed mocks (**Wawel: The Dragon's Hill**, **Signal Garden**) — a real observatory replaces a same-named mock, and the mocks are the fallback so the universe is never empty.

**Key actions:**
- Select a node or a Registry item → Inspector updates (selection stays in sync both ways).
- `Open art-story` on an observatory → full-screen `ObservatoryStory` overlay (DL-49); Esc / close restores focus.
- Orbit / pan / zoom the sphere.
- Toggle theme; use the CTA (authenticated without an observatory → `/create`; unauthenticated → `/signup` or `/login`).

**Not built (deferred):** the publication feed, the ranked-observatory list view, full-text search, upvoting, and a separate "Map" view. These belong to the earlier AI-research plan and to future patches; the single terminal replaced the Feed/Observatories/Map view-switcher.

---

## Screen 6 — Create Observatory

**Route:** `/create`
**Auth required:** Yes
**Redirect if Observatory exists:** `/dashboard`

**Purpose:**
3-step flow for creating an Observatory after the user has explored topology context in `/explore`. This is the first target screen for Premium Dark Glass UI foundation rollout (DL-29).

> **PATCH-PIVOT-04 (DL-41/DL-42):** the flow is the Observatory Studio — World → Identity → Board → Signature + Preview → Finish. Base fields persist via `POST /api/v1/observatories`; the board, photos, and the `world` choice are saved locally for now (no content model / storage provider yet); AI-generation steps are deferred — the visual signature is chosen manually.

Real flow (code: `STEPS = ['World','Identity','Board','Signature','Finish']`) with a persistent live preview aside throughout.

### Step 1 — World
- Choose the draft's `world` (virtual / real) in the LOCAL draft only (DL-39/DL-42). A forward-looking flag: **not sent to the API** and **not shown on the graph** (single-world UI, DL-48).

### Step 2 — Identity
- Observatory name (permanent, unique) with real-time availability check (`GET /api/v1/observatories/check/:name`)
- Live address preview: `rai.app/@name`
- Display name (pre-filled from account, changeable later)
- Bio (max 160 chars, counter)
- Domain association: pill selector for 0–2 active Domains (optional)
- Social links (known keys only)
- Observatory type: individual / studio / product

### Step 3 — Board
- Board builder: add / edit / reorder / delete blocks (heading / text / image / note / link + caption); optional `variant?` / `fullBleed?` hints (DL-49). Image previews are local.
- The board, blocks, and photos live in `localStorage['rai-observatory-draft']` only (photos session-only). **Not persisted to the API** — board publishing + storage are deferred (DL-42).

### Step 4 — Signature
- The visual signature is chosen **manually** (presets + parameter controls) — **no AI generation** (DL-42). Drives the live preview and the graph node accent.

### Step 5 — Finish
- The persistent live preview renders the draft as a public observatory story via the shared `ObservatoryStory` renderer (DL-49) and as a node in the graph language.
- On finish, `POST /api/v1/observatories` persists **base fields only** — name, displayName, type, publicMode, domainIds, bio, socialLinks, visualSignature (DL-41). One observatory per user; board / photos / `world` stay in the local draft.
- Post-creation redirect: `/dashboard`.

---

## Screen 7 — Control Panel (Dashboard)

**Route:** `/dashboard`
**Auth required:** Yes

**Purpose:**
The owner's management interface for their Observatory. Central hub for all management actions.

> **PATCH-PIVOT-06 (DL-47):** Dashboard baseline is now implemented — identity card (name/address/type/publicMode/bio/domain pills/reputation+publications), an "as a node" preview in the graph language, an editable identity form (PATCHes base fields via `PATCH /api/v1/me/observatory`; `name` is read-only/immutable), and a read-only local board-draft section (board publishing is deferred, DL-42). Systems/Publications/Settings/Visual-Signature-AI sub-screens remain out of scope. No-observatory users are redirected to `/create`.

**Primary components (DL-47 baseline):**
- **Identity card:** name, address (`rai.app/@name`), type, publicMode, bio, domain pills, reputationScore + publicationsCount — from `GET /api/v1/me/observatory`.
- **"As a node" preview:** a static SVG orb in the graph language (no second heavy 3D mount).
- **Editable identity form:** PATCHes base fields via `PATCH /api/v1/me/observatory` (displayName, bio, domainIds [0–2 active], socialLinks, publicMode, visualSignature, type). **`name` is read-only / immutable** after creation.
- **Local board-draft section:** read-only, with honest "board publishing is coming" copy (DL-42).

**Not built (deferred):** metrics (visitors / views / upvotes), credits / plan management, and the Systems / Publications / Publish / Visual-Signature / Settings sub-screens. No-observatory users are redirected to `/create`.

---

## Screens 8–14 — Not built (deferred)

The following screens were specified for the earlier AI-research MVP and are **not built**.
They are retained here as historical intent, not as current reality — do not describe them as
done. Each depends on a product surface the pivot has not shipped (a Systems model surface, a
Publication engine, AI generation, board publishing + storage, or account settings).

| # | Screen | Route | Why deferred |
|---|---|---|---|
| 8 | Systems Management | `/dashboard/systems` | No Systems surface in the pivot; the `System` model is unused schema scaffolding (DL-16 superseded). |
| 9 | Publications Management | `/dashboard/publications` | No publication engine (DL-15 superseded). |
| 10 | Publish | `/dashboard/publish` | No AI-formatting / BullMQ / SSE pipeline is built. |
| 11 | Visual Signature (AI) | `/dashboard/visual` | The signature is chosen **manually** in the Studio; no AI generation (DL-42). |
| 12 | Observatory Public Page | `/observatory/:name` | The art-story is presented as an in-Terminal overlay (DL-49); a standalone public page waits on board publishing + storage (DL-42). |
| 13 | Publication Page | `/publication/:id` | No publications exist. |
| 14 | Settings | `/dashboard/settings` | No account-settings surface is built; public/private is toggled via the Dashboard identity form (`publicMode`). |

When any of these ships, restore a full spec here and record the decision in
[`decision-log.md`](decision-log.md).

---

## Screen 15 — Privacy Policy

**Route:** `/privacy`
**Auth required:** No

**Purpose:**
Standard privacy policy page required for launch.

---

## Screen 16 — Terms of Service

**Route:** `/terms`
**Auth required:** No

**Purpose:**
Standard terms of service page required for launch.
