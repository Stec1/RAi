# RAi — Kill-Map (v1 code disposition, verified at R-00)

> Every row cites a real path, verified against the code at GENESIS R-00
> (`main` @ `f3f0703`). Tags: **KEEP** (survives as-is) · **EVOLVE** (survives, changes at the
> named step) · **DEMOLISH@R-XX** (deleted at that step) · **DROP@R-10** (database table drop at
> R-10, pending confirmation). Nothing is deleted at R-00 — this document schedules, it does not
> execute. Interim strategies keep the app deployable between steps (R-DL-09).

---

## Web — Explore + topology

| ID | Path | Tag | Interim / notes |
|---|---|---|---|
| W-01 | `apps/web/src/components/topology/TopologyGraph3D.tsx` | EVOLVE — @R-01 ✅ done, @R-03…R-05 | R-01 interim: remove domain nodes/edges and the domain-cone placement; observatories get deterministic name-hash shell positions and their VisualSignature primary color, so Explore never breaks between R-01 and R-03. R-03: full-screen meta-graph + new spatial model (Design round A). R-04 depth, R-05 life. |
| W-02 | `apps/web/src/components/topology/topology-layout.ts` | DEMOLISHED @R-01 ✅ | Dead code from the pre-PP-05 SVG topology (its own header says "for the /explore SVG topology"). Only `DomainSeed` + `domainColor` are still imported — both domain concepts that die with domains. Earliest safe step: R-01. |
| W-03 | `apps/web/src/components/topology/ExploreInfoPanel.tsx` (+ `.module.css`) | DEMOLISH @R-03 (R-01 interim ✅) | This IS the docked Inspector (imported by RaiTerminal). Replaced by the floating selected-node card. R-01 interim: strip domain rows only. |
| W-04 | `apps/web/src/components/terminal/RegistryRail.tsx` | DEMOLISH @R-03 (R-01 interim ✅) | Terminal side column. R-01 interim: remove domain sections, keep a flat world list. |
| W-05 | `apps/web/src/components/terminal/ActivityStrip.tsx` | DEMOLISH @R-03 | Mock activity feed; no real data source. |
| W-06 | `apps/web/src/components/terminal/GuestIntroPanel.tsx` | DEMOLISH @R-03 | Guest copy panel; absorbed into the minimal HUD / landing per Design round A. |
| W-07 | `apps/web/src/components/terminal/TerminalHeader.tsx` | EVOLVE @R-03 | Becomes the thin top strip of the minimal HUD. |
| W-08 | `apps/web/src/components/terminal/RaiTerminal.tsx` | EVOLVE — @R-01 ✅ done, @R-03 | R-01: drop the domain fetch + domain wiring. R-03: recomposed as the full-screen graph shell (side columns gone). |
| W-09 | `apps/web/src/components/terminal/ArtStoryOverlay.tsx` | EVOLVE @R-03 | The "descend into a world" entry. Overlay vs route-navigation transition is fixed in Design round A; KEEP as-is until then. |
| W-10 | `apps/web/src/components/observatory/ObservatoryStory.tsx` (+ `.module.css`) | EVOLVE | The single world renderer — the composer's target (R-DL-11). R-01: renders server-persisted blocks. R-02: real image blocks. R-08: mastery pass. |

## Web — studio, dashboard

| ID | Path | Tag | Interim / notes |
|---|---|---|---|
| W-11 | `apps/web/src/components/studio/ObservatoryStudio.tsx` (+ `.module.css`) | DEMOLISH @R-07 (R-01 interim ✅) | The v1 stepper (World → Identity → Board → Signature → Finish); the Composer replaces it. Keep until R-07. R-01 interim: remove the World (virtual/real) step and domain pills; point the board draft at server persistence. R-02 interim: wire real image uploads. |
| W-12 | `apps/web/src/components/studio/NodePreview.tsx` | EVOLVE @R-03 | Used by BOTH the studio and DashboardScreen — survives the studio demolition. Updates to R-DL-10 node identity at R-03. |
| W-13 | `apps/web/src/components/dashboard/DashboardScreen.tsx` | EVOLVE — @R-01 ✅ done, @R-08 | R-01: domain pills out, `visibility` control in. R-08: simplified to the v2 owner surface. R-09: credits/plan display. |
| W-14 | `apps/web/src/data/mock-observatories.ts` | EVOLVED @R-01 ✅ (module DELETED) | Becomes RA's own first worlds (Wawel, Signal Garden — R-DL-03), recomposed under the new content model in Phase 1. The `kind` virtual/real values, `domainSlug`, and fixed layout offsets die here. |
| W-15 | `apps/web/src/lib/universe-observatories.ts` | EVOLVED @R-01 ✅ | DTO drops `domainIds`, gains `visibility`; the real+mock merge becomes real + RA's first worlds. |
| W-16 | `apps/web/src/lib/topology-types.ts` | EVOLVED @R-01 ✅ | Remove `DomainDTO` and domain-shaped types; keep selection/view-command types. |

## Web — chassis (kept)

| ID | Path | Tag | Interim / notes |
|---|---|---|---|
| W-17 | `apps/web/src/lib/post-auth-redirect.ts` | KEEP | Destination flips to the Composer at R-07. |
| W-18 | `apps/web/src/hooks/useAuth.ts` · `apps/web/src/lib/auth-client.ts` | KEEP | |
| W-19 | `apps/web/src/components/auth/{AuthCard,AuthField,AuthShell,AuthSubmit,LoginForm,SignupForm}.tsx` | KEEP | Copy sweep at R-10. |
| W-20 | `apps/web/src/components/landing/TopBar.tsx` · `Footer.tsx` · `Reveal.tsx` | EVOLVE @R-10 / KEEP | TopBar + Footer get the new landing + copy at R-10. `Reveal` is KEEP — used by ObservatoryStory and `/about`. |
| W-21 | `apps/web/src/components/theme/ThemeToggle.tsx` · `apps/web/src/styles/globals.css` | KEEP | Token system + dual theme are chassis (R-DL-11). |
| W-22 | `apps/web/src/components/ui/{GlassCard,GlassPanel,GlassButton,PageShell}.tsx` | KEEP | |
| W-23 | `apps/web/src/app/page.tsx` · `apps/web/src/app/explore/page.tsx` | EVOLVE @R-03, @R-10 | Both render the terminal today. R-03: graph shell. R-10: `/` becomes the new landing (working assumption; OQ-07). |
| W-24 | `apps/web/src/app/create/page.tsx` | EVOLVE @R-07 | Mounts the Composer instead of the studio. |
| W-25 | `apps/web/src/app/dashboard/page.tsx` | EVOLVE @R-08 | |
| W-26 | `apps/web/src/app/{about,login,signup,privacy,terms}/page.tsx` | KEEP | Copy is v1-era → C-01 sweep at R-10. |
| W-27 | `/@name` public world route | CREATED @R-01 ✅ | New top-level dynamic segment (or middleware rewrite) accepting the `@`-prefixed handle; engineering shape decided at R-01. |
| W-28 | `@react-three/drei` + `@react-three/fiber` in `apps/web/package.json` | DEMOLISH @R-02 (moved) | **Dead dependencies** — declared but imported nowhere (verified by grep). PROMPT CONFLICT at R-01: the R-01 prompt froze deps + lockfile, so this row was NOT executed there (reported in the R-01 PR); moved to R-02, the next step that opens the lockfile. |

## API

| ID | Path | Tag | Interim / notes |
|---|---|---|---|
| A-01 | `apps/api/src/routes/domains.ts` | DEMOLISHED @R-01 ✅ | With the Domain model. |
| A-02 | `apps/api/src/index.ts` | EVOLVE — @R-01 ✅ done, later steps pending | R-01: drop the domains registration; later steps register v2 routes (media R-02, composer R-06, Stripe R-09). |
| A-03 | `apps/api/src/routes/observatories.ts` | EVOLVED @R-01 ✅ | Becomes API v2 core: drop `domainIds` validation; add `visibility`, content blocks, public world fetch by name, and the graph list (public worlds: name, displayName, visualSignature). |
| A-04 | `apps/api/src/routes/me.ts` | EVOLVED @R-01 ✅ | Same model changes on the owner routes; `name` stays immutable. |
| A-05 | `apps/api/src/lib/observatory-validation.ts` | EVOLVED @R-01 ✅ | Drop domain checks; add visibility + content-block validation. |
| A-06 | `apps/api/src/routes/{health,auth}.ts` · `apps/api/src/lib/{auth,prisma,redis}.ts` · `apps/api/src/plugins/{auth-guard,rate-limit}.ts` | KEEP | Rate-limit plugin gains composer limiters at R-06. |
| A-07 | New routes: media presign · RA composer · Stripe | CREATE @R-02 / @R-06 / @R-09 | Per `architecture.md` §3; secrets server-side only. |

## Prisma (`apps/api/prisma/schema.prisma`, `seed.ts`)

| ID | Path / model | Tag | Interim / notes |
|---|---|---|---|
| P-01 | `Domain` model + `Observatory.domainIds` | DEMOLISHED @R-01 ✅ (migration #1) | Migration #1. Nothing in v2 references domains. |
| P-02 | `apps/api/prisma/seed.ts` | EVOLVED @R-01 ✅ (RA's first worlds) | Domain seed and v1 test observatories go; the new seed shape is decided at R-01. Production cleanup of already-seeded test rows = OQ-08. |
| P-03 | `Observatory` model | EVOLVED @R-01 ✅ | + `visibility` enum, + content JSONB; − `domainIds`; `publicMode` replaced by `visibility` (existing-row mapping = OQ-06). `userId @unique` and `name @unique` stand (R-DL-04/05). |
| P-04 | `System` · `Publication` · `PublicationUpvote` · `ObservatoryVisit` models (+ `SystemType`, `SystemStatus`, `PublicationStatus` enums) | DROP @R-10 | Pending founder confirmation (OQ-05, R-DL-12). Untouched until then; no routes or UI reference them. |
| P-05 | `AIGeneration` · `CreditTransaction` · `Subscription` · `User.planTier` · `User.creditsBalance` (+ `GenerationType`, `GenerationStatus`, `TransactionType`, `SubscriptionStatus`, `PlanTier` enums) | KEEP | The billing/AI substrate (R-DL-12). `GenerationType` values evolve at R-06 for composer generations. |
| P-06 | `User` core + Better Auth tables (`Session`, `Account`, `Verification`) | KEEP | |

## packages/shared

| ID | Path | Tag | Interim / notes |
|---|---|---|---|
| S-01 | `packages/shared/src/types/domain.ts` (+ its export in `types/index.ts`) | DEMOLISHED @R-01 ✅ | |
| S-02 | `packages/shared/src/types/{system,publication}.ts` (+ exports) | DROP @R-10 | Mirrors of the P-04 tables; go when they go. |
| S-03 | `packages/shared/src/types/observatory.ts` | EVOLVED @R-01 ✅ | Gains `visibility` and content-block types; loses `domainIds`. |
| S-04 | `packages/shared/src/types/{visual-signature,user}.ts` | KEEP | VisualSignature evolves with the composer, never restarts (R-DL-11). |
| S-05 | `packages/shared/src/utils/{observatory-name,reserved-names,display-name}.ts` | KEEP | The `@name` address validation lives here already. |

## Copy

| ID | Area | Tag | Interim / notes |
|---|---|---|---|
| C-01 ✅R-01 spot fix done | v1-era copy across `apps/web/src/app/{about,login,signup,privacy,terms}` and surviving chrome (domain language, "coming soon" domains, terminal guest copy) | DEMOLISH @R-10 | Full sweep with the new landing; earlier spot fixes wherever a surface is rebuilt (R-03, R-07, R-08) — and at R-01 the `/about` passages that describe the seven domains (e.g. `apps/web/src/app/about/page.tsx` "seven domains around it") must be spot-fixed, since they become factually false the moment domains are demolished. |

---

## Per-step touch lists

Which rows each session executes. (CREATE rows are listed at their step for completeness.)

| Step | Executes |
|---|---|
| **R-01** ✅ done (`genesis-r-01`) | W-01 (interim), W-03 (interim), W-04 (interim), W-08 (interim), W-11 (interim), W-13 (interim), W-14, W-15, W-16, W-27 (create), **W-02, A-01 (demolish)**, A-02, A-03, A-04, A-05, P-01 (demolish), P-02, P-03, **S-01 (demolish)**, S-03, C-01 (domain-copy spot fix) · migration #1. W-28 NOT executed — prompt froze the lockfile; moved to R-02. |
| **R-02** | A-07 (media presign, create), A-02, W-10 (image blocks), W-11 (interim upload wiring), P-03 (media shape in content blocks), **W-28 (demolish — moved from R-01)** |
| **R-03** | Design round A → **W-03, W-04, W-05, W-06 (demolish)**, W-01, W-07, W-08, W-09, W-12, W-23 · C-01 spot fixes |
| **R-04** | W-01 (LOD, constellations, search + fly-to, camera, instancing) |
| **R-05** | W-01 (freshness glow, birth pulse, ambient flows), A-03 (graph list gains freshness fields if needed) |
| **R-06** | A-07 (composer routes, create), A-02, A-06 (composer rate limits), P-05 (`GenerationType` evolve) |
| **R-07** | Design round B → **W-11 (demolish)**, W-24, W-17 (redirect target) · C-01 spot fixes |
| **R-08** | W-10 (mastery), W-13, W-25, share/OG (new, engineering shape at R-08) · C-01 spot fixes |
| **R-09** | A-07 (Stripe, create), A-02, P-05 (Subscription wiring), W-13 (credits/plan UI) |
| **R-10** | W-19, W-20, W-23 (`/` → landing, OQ-07), W-26, **C-01 (full sweep)**, **P-04 + S-02 (drop, pending OQ-05)** · perf/mobile audit · final doc sync |
