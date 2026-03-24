# RAi — Product Roadmap

> Living document. Updated weekly.
> This is not a schedule with dates. It is a system of orientations.

**Last updated:** [date]

---

## Current Phase

**Phase A — Foundation**

Building the documented, deployed, data-ready base.
Active issues: ISSUE-00 → ISSUE-03.

---

## Current Milestone

### Milestone 1: Auth-Ready Backend

Considered complete when:
- `GET /api/health` → 200 on production
- Monorepo structure deployed
- Database schema deployed and migrated
- 7 Planets seeded in DB
- User can register and log in
- CI/CD pipeline green on both Vercel and Railway

**Status:** 🔵 In Progress

---

## Next 3 Milestones

### Milestone 2: Map is Alive
**Unlocks after:** Phase D complete (ISSUE-10 merged)

Considered complete when:
- Explore map renders with RA, all 7 Planets, and real Meta Stars from DB
- Zoom, pan, hover, click — all working
- Nav panel interactions functional
- Someone can visit `rai.app/explore` and feel "I am looking at a meta-universe"
- The map looks like a realistic cosmic system — not a game UI

**This is the first moment the product communicates itself without words.**
If the map looks wrong at this milestone, stop and fix the visual before proceeding.

**Status:** ⬜ Not Started

---

### Milestone 3: First Star in the Universe
**Unlocks after:** Phase E + F complete (ISSUE-12 merged)

Considered complete when:
- User can complete the full creation flow (Identity → Atmosphere → Visibility)
- Meta Star appears in Profile with atmosphere visual
- If public: Meta Star appears on the Explore map
- Profile dashboard shows visitor metrics
- First self-demo possible: register → create → see your star on the map → share link

**Status:** ⬜ Not Started

---

### Milestone 4: Soft Launch Ready
**Unlocks after:** Phase J complete (ISSUE-16 merged)

Considered complete when:
- Payments E2E working (test mode)
- Public Star Preview and share working
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
| C — Public UI | 06–07 | Start Page + About + Login |
| D — Map | 08–10 | Explore map + interactions |
| E — Creation | 11 | Create Your Meta 3-step flow |
| F — Profile | 12 | Profile dashboard |
| G — AI | 13 | AI Atmosphere Generator |
| H — Preview | 14 | Public Star Preview + Share |
| I — Payments | 15 | Stripe credits + subscription |
| J — Launch | 16 | QA + monitoring + production |

---

## What Success Looks Like

### At Soft Launch (50 users):
- NPS > 30
- WOW moment reproduces every time: claim → generate → star on map
- No critical bugs after 48 hours

### At 30 days post-launch:
- D7 retention > 20%
- First paying users (credits or Pro)
- Organic shares (someone shared their star unprompted)

### At Public Launch (Product Hunt):
- 500+ active Meta Stars on the map
- D30 retention > 10%
- MRR > $500
- Load test 500 concurrent users clean

---

## Current Risks

| Risk | Level | Mitigation |
|---|---|---|
| Map visual quality below expectation | 🔴 High | Hard stop at Milestone 2 if map looks wrong |
| Three.js performance on mobile | 🟡 Medium | Simplified canvas for mobile, lazy load |
| OpenAI costs at scale | 🟡 Medium | Credit system, spending limits, rate limits |
| Scope creep into enterable worlds | 🔴 High | `docs/future-reference.md` + hard rule |
| Planet names not finalized before seed | 🟡 Medium | Must be decided before ISSUE-03 |
| Solo founder burnout | 🟡 Medium | Feature freeze discipline, "good enough" policy |

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
