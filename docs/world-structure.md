# RAi — World Structure

> Canonical reference for all world objects in the RAi meta-universe.
> Every architectural, product, and development decision must align with this document.
> Cursor Agent reads this before every prompt.

---

## The Meta-Universe

RAi is a spatial meta-universe where every person has one Meta Star — a personal digital world with a unique atmosphere, identity, and address in a shared cosmic space.

The universe has four object types:
```
RA (central star — the source)
│
├── Planets (7 thematic hubs)
│   └── Satellites (planetary companions)
│
└── Meta Stars (personal worlds of users)
    └── Constellation fields (natural clusters of Meta Stars)
```

---

## RA — The Central Star

**What it is:**
RA is the symbolic and visual center of the RAi meta-universe. It is the source around which all other objects orbit. It is not a user-created object — it exists as the anchor of the entire spatial system.

**What it does in MVP:**
- Always visible at the center of the Explore map
- Hover / click → opens an About RAi info panel
- Displays aggregate universe statistics (total Meta Stars, active users)
- Acts as the navigational anchor — all map coordinates are relative to RA

**What it is NOT:**
- Not a user account or profile
- Not a functional layer with CRUD in MVP
- Not an enterable space in MVP

**Technical:**
- Static object in the WebGL scene with animated glow and corona
- No dedicated DB table required
- Info panel pulls aggregate metrics from API

---

## Planets — Thematic Hubs

**What they are:**
Seven thematic spaces that give structure to the meta-universe. Each Planet represents a creative or intellectual domain. Meta Stars can associate with one or two Planets when created.

**What they do in MVP:**
- Static objects on the map at fixed orbital positions around RA
- Hover → highlights associated Meta Stars on the map
- Click → slide-in info panel with Planet name, description, and associated Meta Stars
- During Meta Star creation: user may select 1–2 Planet associations
- Act as thematic filters and discovery clusters

**What they are NOT in MVP:**
- Not enterable spaces
- Not user-created objects
- Not editable by users

**Technical:**
- `Planet` table: `id`, `name`, `slug`, `description`, `theme`, `position_x`, `position_y`
- `Star.planetIds[]` — array field, 1–2 planets per star
- Populated via static seed data on first deploy
- Positions are fixed and defined in seed

---

## Satellites — Planetary Companions

**What they are:**
Objects bound to Planets. In the full universe vision, Satellites are independent functional spaces — potentially group or organizational entities with their own logic.

**What they do in MVP:**
- Exist as world logic — their presence is architecturally reserved
- Rendered as small visual objects near their parent Planets on the map
- No user interaction beyond visual presence
- Nav item "Satellites" in Explore opens a "Coming soon" info panel

**What they are NOT in MVP:**
- Not interactive
- Not user-created
- Not editable

**Technical:**
- `Satellite` table: `id`, `planetId`, `name`, `description` — seed data or empty
- Reserved in schema for Phase 2 activation

---

## Meta Stars — Personal Worlds

**What they are:**
The core social and product layer of RAi. Each user gets one Meta Star: a unique spatial presence with an address, atmosphere, and identity in the shared meta-universe.

**What they do in MVP:**
- One per user account — permanent, cannot be transferred
- Unique permanent address: `rai.app/@name`
- AI-generated atmosphere — defines color, particles, fog, and visual style on the map
- Public mode: visible on the map and via direct link
- Private mode: accessible only via direct link, invisible on map
- Owner manages via Profile dashboard
- Visitors see via Public Star Preview

**Visibility rules:**
- `public` → appears on Explore map + accessible via direct URL
- `private` → accessible via direct URL only, invisible on map

**Technical:**
- `Star` table: `id`, `userId`, `name` (unique), `displayName`, `type`, `publicMode`, `atmosphereParams` (JSONB), `planetIds[]`, `bio`, `createdAt`
- Map position generated via `nameHash(name) → deterministic x/y coordinates`
- `atmosphereParams` structure: `{ primaryColor, secondaryColor, fogDensity, particleType, particleCount, ambientMood, glowIntensity, mapMarkerStyle }`

---

## Relationship Summary

| Object | Created by | Editable by | Visible on map | Enterable in MVP |
|---|---|---|---|---|
| RA | System | Nobody | Always | No |
| Planet | System (seed) | Nobody | Always | No |
| Satellite | System (seed) | Nobody | Visually only | No |
| Meta Star | User | Owner | If public | No |

---

## What Does Not Exist in MVP

- Constellation mechanics (social graph between Meta Stars)
- Group or organizational Meta Stars
- Enterable star worlds (deep spatial navigation)
- Enterable Planets
- Satellite creation by users
- Real-time presence indicators
- Web3 / wallet / NFT layer
