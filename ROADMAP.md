# RAi — Product Roadmap

> Living document. Updated weekly.
> This is not a schedule with dates. It is a system of orientations.

**Last updated:** [date]

---

## Current Phase

**Phase A — Foundation**

Rewriting documentation, building the monorepo scaffold, infrastructure, and data layer.
Active issues: ISSUE-00 → ISSUE-03.

---

## Current Milestone

### Milestone 1: Auth-Ready Backend

Considered complete when:
- `GET /api/health` → 200 on production
- Monorepo structure deployed
- Database schema deployed and migrated
- 7 Domains seeded in DB (3 active, 4 Coming Soon)
- User can register and log in
- CI/CD pipeline green on both Vercel and Railway

**Status:** 🔵 In Progress

---

## Next 4 Milestones

### Milestone 2: Intelligence Topology is Alive
**Unlocks after:** Phase D complete (ISSUE-10 merged)

Considered complete when:
- Explore renders with RA, all 7 Domains, and real Observatories from DB
- Active vs Coming Soon Domains visually distinguishable
- Pan, zoom, hover, click — all working
- Nav panel interactions functional
- Someone can visit `rai.app/explore` and feel "I am looking at an intelligence network"
- The topology looks like a data-driven network — not a game or cosmic scene

**This is the first moment the product communicates itself visually.**
If the topology looks wrong at this milestone, stop and fix the visual before proceeding.

**Status:** ⬜ Not Started

---

### Milestone 3: First Publication in the Platform
**Unlocks after:** Phase H complete (ISSUE-14 merged)

Considered complete when:
- User can complete the full flow: create Observatory → register System → paste raw output → AI formats → publication appears
- Publication standalone page renders with full formatting
- Publication appears in Explore feed
- Control Panel shows publication management
- First self-demo possible: register → create → publish → see it in feed → share link

**Status:** ⬜ Not Started

---

### Milestone 4: Observatory as Premium Research Space
**Unlocks after:** Phase I complete (ISSUE-15 merged)

Considered complete when:
- Observatory public page renders as a premium research identity
- Systems displayed as structured proof cards
- Publications displayed as a vertical card stack
- OG image generates correctly for social sharing
- Visitor tracking works
- Someone visiting `/observatory/:name` feels "this is a serious research space"

**Status:** ⬜ Not Started

---

### Milestone 5: Soft Launch Ready
**Unlocks after:** Phase N complete (ISSUE-20 merged)

Considered complete when:
- Payments E2E working (test mode)
- Upvotes and reputation system live
- Explore feed with discovery and search working
- PostHog and Sentry active
- Load test: 50 concurrent users, p95 < 800ms, 0 errors
- Privacy Policy + Terms of Service published
- E2E flow tested 5 times on clean accounts
- Mobile QA: iPhone Safari + Android Chrome — no errors

**Status:** ⬜ Not Started

---

## Issue Execution Order

| Phase | Issues | Primary Deliverable |
|---|---|---|
| A — Foundation | 00–03 | Docs + infra + DB + seed |
| B — Auth | 04–05 | Auth + identity logic |
| C — Public UI | 06–07 | Start Page + About + Auth screens |
| D — Map | 08–10 | Intelligence topology + interactions |
| E — Creation | 11 | Create Observatory 3-step flow |
| F — Control Panel | 12 | Owner management dashboard |
| G — Systems | 13 | System registration + management |
| H — Publications | 14 | Publication system + AI formatting |
| I — Public Pages | 15 | Observatory public page |
| J — Discovery | 16 | Explore feed + search |
| K — Reputation | 17 | Upvote + reputation system |
| L — Visual | 18 | AI Visual Signature generator |
| M — Payments | 19 | Stripe credits + subscription |
| N — Launch | 20 | Analytics + QA + production |

---

## Phase Gates

| Gate | After Issue | Question |
|---|---|---|
| Gate 1 | ISSUE-10 | Does the topology communicate "intelligence network"? |
| Gate 2 | ISSUE-14 | Does the publication flow deliver core value? |
| Gate 3 | ISSUE-15 | Does the Observatory page feel like a premium research space? |
| Gate 4 | ISSUE-20 | Ready for 50 invited users? |

---

## What Success Looks Like

### At Soft Launch (50 users):
- NPS > 30
- WOW moment reproduces every time: create → publish → get discovered
- No critical bugs after 48 hours

### At 30 days post-launch:
- D7 retention > 20%
- First paying users (credits or Pro)
- Organic shares (someone shared their Observatory unprompted)

### At Public Launch (Product Hunt):
- 500+ Observatories with published content
- D30 retention > 10%
- MRR > $500
- Load test 500 concurrent users clean

---

## Current Risks

| Risk | Level | Mitigation |
|---|---|---|
| Publication AI formatting quality | 🔴 High | Test 10+ raw inputs before merge. Hard stop at Milestone 3 if output quality is poor |
| Intelligence topology visual quality | 🟡 Medium | Hard stop at Milestone 2 if topology looks wrong |
| OpenAI costs at scale | 🟡 Medium | Credit system, spending limits, rate limits |
| Scope creep into post-MVP features | 🔴 High | `docs/future-reference.md` + hard rule |
| Domain names not finalized before seed | 🟡 Medium | Must be decided before ISSUE-03 |
| Solo founder burnout | 🟡 Medium | Feature freeze discipline, "good enough" policy |
| Cold start problem (empty feed) | 🟡 Medium | Seed test Observatories and publications, invite targeted early users |

---

## Review Cadence

**Daily (5 minutes):**
- Update current issue status
- Note: what was done / what is today / what is blocked

**Weekly (20 minutes, Sunday):**
- Update "Last updated" in this file
- Check if current milestone is on track
- Update risk levels
- Review backlog for new items

**After each milestone:**
- Run self-demo
- Update Current Phase and Current Milestone
- Record key learnings in `docs/decision-log.md`
