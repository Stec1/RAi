# RAi — Future Reference

> This document records post-MVP mechanics and concepts.
> Items here are NOT to be built in MVP under any circumstances.
> Recording them here prevents scope creep while preserving the vision.
>
> Agent rule: No item from this document is implemented without
> a dedicated new issue and explicit founder decision.

---

## Media Attachments

**What it is:**
Rich media support in publications — images, video embeds, interactive demos, 3D previews. Allows creators to attach visual and interactive evidence to their publications.

**Why it's not in MVP:**
Media handling requires storage infrastructure (Cloudflare R2 integration), content moderation, responsive rendering, and bandwidth management. Publications in MVP are text-only to keep the formatting pipeline focused and reliable.

**Status:** `[PHASE 2 — NOT MVP]`

**When to revisit:** After publication formatting is validated with real users and the text-based format proves the core value loop.

---

## Citation System

**What it is:**
Publications can reference other publications within RAi, creating a graph of connected research. Citations are tracked and contribute to the cited publication's and Observatory's reputation.

**Why it's not in MVP:**
Citation mechanics require a stable base of publications to reference, UI for citation insertion and display, and backend for graph tracking. Building this before there is content to cite is premature.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Verification Badges

**What it is:**
Verified status for Observatories — indicating that the Observatory owner's identity or organizational affiliation has been confirmed by the RAi team.

**Why it's not in MVP:**
Verification requires a manual review process, trust framework, and sufficient user base to make verification meaningful. Too early for launch.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Comments on Publications

**What it is:**
Threaded discussion on publications. Community members can leave feedback, ask questions, or engage with the research presented.

**Why it's not in MVP:**
Comments require moderation tools, notification infrastructure, and enough active users to generate meaningful discussion. Upvotes provide sufficient community evaluation signal for launch.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Research Commissions

**What it is:**
A marketplace feature where clients can post research requests or challenges, and Observatory owners can submit publications in response. Enables demand-side discovery — clients describe what they need, and AI creators compete on quality.

**Why it's not in MVP:**
Commissions require a two-sided marketplace with escrow, deliverable validation, and dispute resolution. This is a significant product expansion that requires a proven supply side first.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Collaboration Tools

**What it is:**
Multi-user Observatories, shared publication authorship, team management. Allows organizations and teams to operate a single Observatory collaboratively.

**Why it's not in MVP:**
Collaboration requires role-based access control, invitation flows, conflict resolution for concurrent edits, and team billing. Solo Observatory ownership is sufficient for launch.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Benchmarks

**What it is:**
Standardized capability testing — structured challenges that AI systems can be evaluated against, producing comparable results across Observatories. Creates objective performance baselines.

**Why it's not in MVP:**
Benchmarks require challenge design, automated evaluation infrastructure, and a community consensus on what constitutes fair testing. This is a complex product layer on top of the publication system.

**Status:** `[PHASE 3 — NOT MVP]`

---

## AI-Assisted Matching

**What it is:**
Intelligent matching between clients looking for AI solutions and Observatories that demonstrate relevant capabilities. Uses publication content, system descriptions, and Domain associations to suggest matches.

**Why it's not in MVP:**
Matching requires sufficient data (publications, client queries, interaction patterns) to train useful recommendations. Building a matching engine before there is data to match on is premature.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Studio Tier

**What it is:**
A premium team tier beyond Pro — designed for AI studios, agencies, and organizations. Includes team member management, shared Observatory with role-based permissions, advanced analytics, priority support, and custom branding.

**Why it's not in MVP:**
Studio tier requires collaboration tools (Phase 3), advanced analytics, and a proven individual/Pro subscription base to justify the investment.

**Status:** `[PHASE 4 — NOT MVP]`

---

## Enterprise

**What it is:**
Self-hosted or white-label RAi deployments for large organizations. Private instances with custom Domain structure, internal publication workflows, and enterprise SSO.

**Why it's not in MVP:**
Enterprise deployment requires a mature, battle-tested product, multi-tenancy architecture, and dedicated support infrastructure. This is a long-term revenue expansion.

**Status:** `[PHASE 4 — NOT MVP]`

---

## Native Mobile App

**What it is:**
iOS and Android native apps for RAi.

**Why it's not in MVP:**
See `docs/decision-log.md` DL-01. Web-first with graceful degradation for mobile browsers.

**Status:** `[PHASE 4 — NOT MVP]`

---

## Real-Time Presence

**What it is:**
Indicators showing who is currently viewing an Observatory, reading a publication, or active on the platform. Live visitor counts and activity indicators.

**Why it's not in MVP:**
Real-time presence requires WebSocket infrastructure, significant backend complexity, and enough concurrent users to make the feature meaningful.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Advanced Analytics

**What it is:**
Detailed analytics for Observatory owners — publication performance over time, reader demographics, traffic sources, Domain-level trends, conversion tracking (views → upvotes → profile visits).

**Why it's not in MVP:**
Basic metrics (visitors, views, upvotes) are sufficient for launch. Advanced analytics require data accumulation over time and a more sophisticated analytics pipeline.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Web3 / On-Chain Identity

**What it is:**
Observatory ownership on-chain, wallet-based authentication, token-gated features, and on-chain reputation.

**Why it's not in MVP:**
See `docs/decision-log.md` DL-03. No blockchain dependency in MVP under any circumstances.

**Status:** `[PHASE 4 — NOT MVP]`

---

## Rules for This Document

1. Adding to this document = valid and encouraged. Any new idea that doesn't belong in MVP goes here.
2. Moving an item from this document to active development requires:
   - A new entry in `docs/decision-log.md`
   - A new GitHub issue
   - An update to `docs/mvp-contract.md`
   - Explicit founder decision
3. Referencing an item from this document in a prompt = immediate architectural risk flag.
