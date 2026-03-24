# RAi — Future Reference

> This document records post-MVP mechanics and concepts.
> Items here are NOT to be built in MVP under any circumstances.
> Recording them here prevents scope creep while preserving the vision.
>
> Cursor Agent rule: No item from this document is implemented without
> a dedicated new issue and explicit founder decision.

---

## Spatial Traversal Reference

**What it is:**
Deep spatial navigation inside Meta Stars or Planets — the ability to "fly into" a world and move through it spatially, not just view it as a profile page.

**Reference example:**
The spatial traversal mechanic demonstrated at `https://virtual.plus-ex.com/showroom?ref=godly` — smooth camera movement through a 3D environment, objects that reveal themselves on approach, depth and parallax that creates genuine presence.

**Why it's not in MVP:**
Building quality enterable worlds requires:
- A full 3D scene per Meta Star (unique per user)
- Portal objects and room system
- Camera navigation controls
- Performance optimization for arbitrary user-generated environments
- Content creation tools for the star owner

This is a complete Phase 2 product expansion — not a feature addition.

**Status:** `[PHASE 2 — NOT MVP]`

**When to revisit:** After soft launch, after D30 retention is measured, after the map and Meta Star creation flow are validated with real users.

---

## Enterable Planets

**What it is:**
Planets that can be "entered" — navigated into as spatial environments with their own atmosphere, content, and other Meta Stars visible within them.

**Why it's not in MVP:**
Each Planet as an enterable space requires its own environmental design, rendering logic, and content strategy. This is Phase 3 territory after the basic map is validated.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Satellite Layer (Full)

**What it is:**
Satellites as user-facing functional objects — potentially organizational entities, group spaces, or thematic sub-hubs attached to Planets.

**Why it's not in MVP:**
Satellites require their own creation flow, ownership logic, and rendering. The visual layer is reserved in MVP but the functional layer is out of scope.

**Status:** `[PHASE 2 — NOT MVP]`

---

## NPC Agents

**What it is:**
AI agents that live inside a Meta Star and can respond to visitors on behalf of the star owner. Could be Q&A agents, narrative characters, or autonomous representatives.

**Why it's not in MVP:**
NPC agents require:
- Persistent system prompts per star
- Conversation history per visitor session
- Token budget management at scale
- UX for the owner to configure the agent

This is a significant product expansion. Not a feature addition.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Constellation Mechanics

**What it is:**
Groups of Meta Stars that form constellations — social structures where multiple stars share a visual grouping on the map and potentially shared spaces or communication channels.

**Why it's not in MVP:**
Constellations require a live user base with enough Meta Stars to form natural groups. Building constellation mechanics before there are users to fill them is premature.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Web3 / On-Chain Identity

**What it is:**
Star ownership on-chain (NFT), wallet-based authentication, token-gated rooms, and on-chain reputation.

**Why it's not in MVP:**
See `docs/decision-log.md` DL-03. No blockchain dependency in MVP under any circumstances.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Creator Economy

**What it is:**
A marketplace layer where Meta Star owners can offer products, services, or experiences to visitors. Revenue flows between creators and the platform.

**Why it's not in MVP:**
Creator economy requires a critical mass of users and a proven retention loop first. Building monetization between users before there are users to monetize is premature.

**Status:** `[PHASE 3 — NOT MVP]`

---

## Real-Time Presence

**What it is:**
Indicators showing who is currently "inside" a Meta Star or somewhere on the map. Live visitor counts, live cursors, live interactions.

**Why it's not in MVP:**
Real-time presence requires WebSocket infrastructure, significant backend complexity, and enough concurrent users to make the feature meaningful. None of these conditions exist at MVP.

**Status:** `[PHASE 2 — NOT MVP]`

---

## Native Mobile App

**What it is:**
iOS and Android native apps for RAi.

**Why it's not in MVP:**
See `docs/decision-log.md` DL-01. Web-first with graceful degradation for mobile browsers.

**Status:** `[PHASE 4 — NOT MVP]`

---

## Rules for This Document

1. Adding to this document = valid and encouraged. Any new idea that doesn't belong in MVP goes here.
2. Moving an item from this document to active development requires:
   - A new entry in `docs/decision-log.md`
   - A new GitHub issue
   - An update to `docs/mvp-contract.md`
   - Explicit founder decision
3. Referencing an item from this document in a Cursor prompt = immediate architectural risk flag.
