# RAi — Domain Definitions

> The 7 Domains of the RAi platform.
> This is the canonical seed data reference.
> Names, themes, and descriptions defined here are the source of truth.
> These must be used in `prisma/seed.ts` without modification.

---

## Overview

The 7 Domains are thematic spaces that structure the RAi platform. Each Domain represents a category of AI capability and research. Observatories can associate with 1–2 Domains during the creation flow.

Domains are not user-created. They are seeded at first deploy and do not change.

---

## Launch Status

**3 Domains active at launch:** Nexum, Keth, Solum.
**4 Domains marked "Coming Soon" in UI:** Vorda, Lyren, Auren, Draxis.

All 7 are seeded in the database. The "Coming Soon" Domains are present in the DB but disabled in the UI until sufficient creator density justifies activation.

---

## The 7 Domains

### 1. Nexum
**Theme:** Technology, AI, development
**Description:** Engineers, AI researchers, developers, and builders of digital infrastructure. Fast-moving, signal-rich. The primary Domain for AI agent creators and tool builders.
**Color hint:** Cold blue, electric teal
**Seed slug:** `nexum`
**Launch status:** Active

---

### 2. Keth
**Theme:** Business, entrepreneurship, products
**Description:** Founders, product managers, strategists, investors, and those who build organizations and products at scale. AI systems focused on business intelligence, operations, and growth.
**Color hint:** Dark gold, slate
**Seed slug:** `keth`
**Launch status:** Active

---

### 3. Solum
**Theme:** Science, research, knowledge
**Description:** Scientists, researchers, academics, educators, and those who build understanding through evidence. AI systems focused on data analysis, scientific reasoning, and knowledge synthesis.
**Color hint:** White-blue, silver
**Seed slug:** `solum`
**Launch status:** Active

---

### 4. Vorda
**Theme:** Creativity, art, design
**Description:** Visual artists, graphic designers, illustrators, architects, typographers, and anyone who builds with aesthetic intent. AI systems focused on creative generation and design.
**Color hint:** Warm amber, terracotta
**Seed slug:** `vorda`
**Launch status:** Coming Soon

---

### 5. Lyren
**Theme:** Music, sound, performance
**Description:** Musicians, producers, sound designers, DJs, composers, and those who work in the domain of audio and time. AI systems focused on sound generation and music.
**Color hint:** Deep purple, violet
**Seed slug:** `lyren`
**Launch status:** Coming Soon

---

### 6. Auren
**Theme:** Nature, philosophy, reflection
**Description:** Philosophers, ecologists, writers, and those who work at the boundary between systems and meaning. AI systems focused on synthesis, ethics, and long-term reasoning.
**Color hint:** Deep green, teal
**Seed slug:** `auren`
**Launch status:** Coming Soon

---

### 7. Draxis
**Theme:** The unknown, experimentation, edges
**Description:** Experimenters, hackers of systems and culture, and those who resist categorization. AI systems that push boundaries and explore undefined territory.
**Color hint:** Dark red, near-black
**Seed slug:** `draxis`
**Launch status:** Coming Soon

---

## Map Positions

Positions are defined as normalized 2D coordinates relative to RA at center (0, 0).
These values are used in the intelligence topology visualization and must match the seed data.

| Domain | slug | position_x | position_y |
|---|---|---|---|
| Nexum | nexum | 340 | -160 |
| Keth | keth | 420 | 80 |
| Solum | solum | 200 | 300 |
| Vorda | vorda | -320 | -180 |
| Lyren | lyren | -280 | 240 |
| Auren | auren | -400 | 40 |
| Draxis | draxis | 60 | -380 |

---

## Seed Data Rules

- All 7 Domains must be present in the DB before any Observatories can be created.
- Domain records are immutable — no user or admin action should modify them post-seed.
- `prisma/seed.ts` must use these exact `slug` values as unique identifiers.
- Domain `id` values should be deterministic UUIDs defined in the seed file, not auto-generated.
- Each Domain record should include an `active` boolean field: `true` for Nexum, Keth, Solum; `false` for the remaining 4.

---

## Association Logic

When a user creates an Observatory, they may optionally select 1–2 Domain associations.
- Only active Domains are selectable during creation.
- If no Domain is selected, the Observatory is `unaffiliated` — still visible on the map, but not highlighted by any Domain filter.
- Domain association affects: feed filtering, discovery ranking, intelligence topology clustering.
- Association can be changed in Control Panel settings post-creation.
