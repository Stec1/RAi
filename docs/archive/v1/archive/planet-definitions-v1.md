# RAi — Planet Definitions

> The 7 Planets of the RAi meta-universe.
> This is the canonical seed data reference.
> Names, themes, and descriptions defined here are the source of truth.
> These must be used in `prisma/seed.ts` without modification.

---

## Overview

The 7 Planets orbit RA at fixed positions on the Explore map. Each Planet represents a thematic domain. Meta Stars can associate with 1–2 Planets during the creation flow.

Planets are not user-created. They are seeded at first deploy and do not change.

---

## The 7 Planets

### 1. Vorda
**Theme:** Creativity, art, design
**Description:** A warm, slow-rotating planet of makers. Home to visual artists, graphic designers, illustrators, architects, typographers, and anyone who builds with aesthetic intent.
**Color hint:** Warm amber, terracotta
**Seed slug:** `vorda`

---

### 2. Nexum
**Theme:** Technology, AI, development
**Description:** A dense, data-rich planet at the edge of the known map. Engineers, AI researchers, developers, and builders of digital infrastructure. Fast-moving, signal-rich.
**Color hint:** Cold blue, electric teal
**Seed slug:** `nexum`

---

### 3. Lyren
**Theme:** Music, sound, performance
**Description:** A resonant, vibrating planet of rhythm and frequency. Musicians, producers, sound designers, DJs, composers, and those who work in the domain of vibration and time.
**Color hint:** Deep purple, violet
**Seed slug:** `lyren`

---

### 4. Solum
**Theme:** Science, research, knowledge
**Description:** A precise, crystalline planet of inquiry. Scientists, researchers, academics, writers of non-fiction, educators, and those who build understanding through evidence.
**Color hint:** White-blue, silver
**Seed slug:** `solum`

---

### 5. Keth
**Theme:** Business, entrepreneurship, products
**Description:** A structured, high-gravity planet of builders and operators. Founders, product managers, strategists, investors, and those who build organizations and products at scale.
**Color hint:** Dark gold, slate
**Seed slug:** `keth`

---

### 6. Auren
**Theme:** Nature, philosophy, space, reflection
**Description:** A distant, slow planet of contemplation. Philosophers, ecologists, writers, meditators, cosmologists, and those who work at the boundary between the self and the universe.
**Color hint:** Deep green, cosmic teal
**Seed slug:** `auren`

---

### 7. Draxis
**Theme:** The unknown, experimentation, edges
**Description:** A chaotic, unmapped planet at the outer boundary of the universe. Experimenters, artists of the undefined, hackers of systems and culture, and those who resist categorization.
**Color hint:** Dark red, near-black
**Seed slug:** `draxis`

---

## Map Positions

Positions are defined as normalized 2D coordinates relative to RA at center (0, 0).
These values are used directly in the WebGL scene and must match the seed data.

| Planet | slug | position_x | position_y |
|---|---|---|---|
| Vorda | vorda | -320 | -180 |
| Nexum | nexum | 340 | -160 |
| Lyren | lyren | -280 | 240 |
| Solum | solum | 200 | 300 |
| Keth | keth | 420 | 80 |
| Auren | auren | -400 | 40 |
| Draxis | draxis | 60 | -380 |

---

## Seed Data Rules

- All 7 Planets must be present in the DB before any Meta Stars can be created.
- Planet records are immutable — no user or admin action should modify them post-seed.
- `prisma/seed.ts` must use these exact `slug` values as unique identifiers.
- Planet `id` values should be deterministic UUIDs defined in the seed file, not auto-generated.

---

## Association Logic

When a user creates a Meta Star, they may optionally select 1–2 Planet associations.
- If no Planet is selected, the Meta Star is `unaffiliated` — still visible on the map, but not highlighted by any Planet filter.
- Planet association affects: hover highlighting on the map, filter behavior, discovery panels.
- Association can be changed in Profile settings post-creation.
