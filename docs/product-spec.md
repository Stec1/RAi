# RAi — Product Spec (RAI 2.0 target surfaces)

> The target state of every surface, tagged with the R-step that delivers it (see
> [`roadmap.md`](roadmap.md)). Where the deployed build still shows RAi v1 behavior, the spec says
> "current v1 behavior until R-XX" — those notes are the truth of the transition, not the target.
> Concept and terminology: [`concept.md`](concept.md).

## Route map (target)

| Route | Surface | Delivered |
|---|---|---|
| `/explore` | The meta-graph (the universe) | R-03 (interim graph from R-01) |
| `/@name` | Public world page | R-01 (mastery at R-08) |
| `/create` | The Composer (conversation with RA) | R-07 (backend R-06) |
| `/dashboard` | Owner dashboard (simplified) | R-08 |
| `/` | Landing (new copy) | R-10 |
| `/login`, `/signup` | Auth | kept; copy at R-10 |
| `/about`, `/privacy`, `/terms` | Info/legal | kept; copy at R-10 |

Current v1 behavior until R-10: `/` renders the same Explore terminal as `/explore`. The final
split (`/` = landing, `/explore` = graph) is the working assumption pending OQ-07.

---

## 1. Explore — the meta-graph (R-03; depth R-04; life R-05)

**Purpose.** The universe itself: every public world as a glowing node around RA. The primary
discovery surface — spatial, not a feed.

**Key content and behavior.**
- **Full-screen graph.** The canvas is the page. The v1 terminal side columns (Registry rail,
  docked Inspector, Activity strip) are removed at R-03.
- **Minimal HUD:** a thin top strip (wordmark, auth-aware nav, theme toggle); a floating card for
  the selected node (world name, owner, one-line description, "Enter"); bottom controls (reset /
  fit / search from R-04).
- **Nodes.** RA at the center; every `public` world is a node whose color is its VisualSignature
  primary color (R-DL-10). No domain nodes, no taxonomy rings.
- **Select → fly-to → descend.** Selecting a node flies the camera to it; confirming descends
  into the world (`/@name`). The exact descend transition (in-place overlay vs route navigation)
  is fixed in Design round A.
- **Depth (R-04):** level-of-detail rendering, color constellations, search + fly-to, camera
  choreography, instancing for larger node counts.
- **Life (R-05):** freshness glow on recently updated worlds, the RA→node birth pulse on publish,
  ambient flows. All effects are driven by real data; nothing decorative is fabricated.

**States.** Empty universe (only RA + RA's first worlds); WebGL unavailable (composed fallback
message — kept from v1); reduced motion (static but composed); loading (calm, no spinner in the
canvas center).

**Current v1 behavior until R-03:** the terminal layout (Registry / sphere graph / Inspector /
Activity) remains. Since R-01 (delivered) the universe is real: no domain nodes, worlds placed by
name-hash golden-spiral slots in their signature colors, RA→world tethers, `{N} worlds · RAI
universe` readouts, no mock fallback (kill-map, row W-01; R-DL-19).

---

## 2. The Composer — a conversation with RA (backend R-06; surface R-07)

**Purpose.** Where a person creates their world by talking to RA. Replaces the v1 stepper studio
(World → Identity → Board → Signature → Finish) entirely.

**Key content and behavior.**
- **Conversation pane.** A dialogue with RA. The user describes their world; RA answers in
  composition: a block sequence, a VisualSignature, draft copy. Streaming responses (R-06).
- **Live world preview.** The draft rendered through ObservatoryStory exactly as the public page
  will render it. Every RA change is visible immediately.
- **Iterate by chat.** Refinements are conversational; RA edits the composition, never emits
  freeform code (R-DL-07).
- **Manual placement.** The user can directly add/replace images (R-02 media) and edit final
  wording — the human's material always wins.
- **Publish.** Sets visibility (`unpublished` → `private`/`public`), confirms the `@name`, and —
  if public — triggers the birth pulse on the graph (R-05).
- **Metering.** Each generation draws on credits (free-tier limits per R-DL-08/OQ-04); the UI
  shows remaining generations honestly.

**States.** New draft (RA opens the conversation); returning draft (server-persisted from R-01 —
the localStorage era ends); generation in progress (streaming); credit limit reached (clear stop
+ upgrade path after R-09); API failure (draft never lost).

**Current v1 behavior until R-07:** `/create` renders the v1 stepper studio (since R-01:
Identity → Board → Signature → Finish — the World step and domain pills are gone, and Finish
persists the board as server `content`; worlds are created `unpublished` with their `/@name`
link shown).

---

## 3. Public world page — `/@name` (R-01; mastery + share R-08)

**Purpose.** The world itself at a permanent address. What a visitor sees; what the owner
publishes.

**Key content and behavior.**
- Rendered by **ObservatoryStory** (the single shared renderer, evolved from v1): signature-driven
  hero, block moods, scroll reveal, dual theme.
- **Visibility enforcement** (R-01): `public` and `private` render for anyone with the URL;
  `unpublished` renders only for the owner (404 for others). Honest states — a world with no
  content yet says so calmly.
- **Share (R-08):** OG image derived from the world's VisualSignature + name; share affordance on
  the page.
- **Entry from the graph:** descending from Explore lands here (transition per Design round A).

**States.** Public; private-by-link; unpublished (owner preview banner / 404 for visitors);
missing name (404); media loading.

**Delivered at R-01:** the route is live — ObservatoryStory-rendered, visibility-enforced
(owner-only view for `unpublished` via cookie-forwarded server fetch), honest status line, calm
404, basic metadata (R-DL-15). Mastery + share/OG remain R-08.

---

## 4. Dashboard — the owner surface (R-08)

**Purpose.** The owner's simplified control surface under the new model. Not a CMS — the composer
is where a world is made; the dashboard is where its status is managed.

**Key content and behavior.**
- World card: name (`@name`, immutable — kept from v1), title, VisualSignature, visibility
  control (unpublished / private / public), link to the public page.
- "Continue composing" → the Composer with the current world loaded.
- Account basics: plan tier + credits (post-R-09), sign out.
- The v1 identity mega-form, domain pills, and read-only board-draft section are removed.

**States.** No world yet (→ Composer); world at each visibility; credits exhausted (post-R-09).

**Current v1 behavior until R-08:** the v1 dashboard baseline remains (since R-01: 3-state
visibility control wired to PATCH, world URL with copy + view actions, "Save story to your
world" for local drafts; domain pills gone; the node preview uses the world's own signature).

---

## 5. Auth + landing (kept; rewritten at R-10)

**Purpose.** Entry into the universe.

**Key content and behavior.**
- **Auth (kept):** Better Auth email + session cookies, same-origin proxy, post-auth redirect
  rules. Functional now; copy and visual pass at R-10.
- **Landing (R-10):** `/` becomes a real landing for RAI 2.0 — what the universe is, one CTA into
  it. Copy written fresh from `concept.md`; no v1 slogans.
- **Onboarding (R-10):** first-run path from signup into the Composer.

**States.** Guest, authenticated-without-world (→ Composer CTA), authenticated-with-world
(→ Dashboard/Explore).

**Current v1 behavior until R-10:** `/` renders the Explore terminal; about/legal pages carry v1
copy.
