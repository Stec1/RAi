# RAi — Visual Reference & Art Direction

> This document sets the visual framework for the entire MVP.
> Every UI and rendering decision aligns with this document.
> When in doubt about how something should look — check here first.

---

## Visual Thesis

RAi is not a game. Not a metaverse platform. Not a sci-fi HUD experience.

RAi is a private observatory at the edge of the known universe.
The map is a real place. The stars are real presences.
The interface disappears into the space.

**One sentence:** RAi looks like what you'd see if you could actually view the meta-universe from a quiet, high-altitude research station.

---

## Core Mood

**Realistic meta-cosmic atmosphere. Premium minimalism. Quiet depth.**

Reference in words:
- The instrument panels of a real observatory — functional, precise, no decoration
- Deep space photography (Hubble, James Webb) — real color, real density, real emptiness
- Japanese minimalism intersected with NASA mission control aesthetics
- Gravity (film) — clean, cold, completely silent
- Brian Eno ambient — space between elements is the design

**What this is NOT:**
- Not Roblox or Fortnite
- Not neon cyberpunk
- Not magical fantasy
- Not flat design with space-themed icons
- Not "space game" UI with HUDs and radars

---

## UI Tone

- **Instrumental, not decorative.** Every element serves a function.
- **Confident, not loud.** No animation for animation's sake.
- **Spatial, not flat.** Depth is communicated through layering and blur, not illustration.
- **Cold but alive.** Cold palette with organic particle movement.
- **Readable in darkness.** Dark mode only in MVP.

UI text tone: short, specific, no marketing hyperbole. Not "Unleash your cosmic identity!" — just "Your star."

---

## The Map

The Explore map is the emotional center of the product. It must feel like looking through a real telescope at a real system.

**How it should feel:**
- You are observing something that exists independently of you
- Stars are not UI elements — they are presences
- RA at the center radiates quiet authority
- Planets occupy their orbits with gravitational weight
- The space between objects is as important as the objects themselves
- Zooming in should feel like approaching, not scaling

**What the map must avoid:**
- Game minimap aesthetic
- Flat circles with labels
- Grid or structured layout
- Harsh outlines or icon-style objects
- Loading spinners in the middle of the map

---

## Color Direction

### Backgrounds
- Deep space base: `#030307` — deepest black with faint blue tone
- Map canvas: `#050509`
- UI panels: `#0a0a12` to `#12121e`
- Surface elevation: `#16161f`

### RA
- Core glow: warm white-gold `#fff4d6`
- Corona: fading amber to transparent `rgba(255, 210, 100, 0.08)`

### Planets (map rendering)
- Each planet uses its own color hint (see `docs/planet-definitions.md`)
- Rendered as textured, glowing spheres with subtle atmosphere edge
- Not flat circles — rendered with depth and rim lighting

### Meta Stars (map rendering)
- Color from `atmosphereParams.primaryColor`
- Size: 3–8px point with glow radius based on `glowIntensity`
- Own star: slightly larger + subtle ring

### UI Text
- Primary: `#e8edf5` — not pure white, slightly warm
- Secondary: `#8890a8` — muted, for metadata
- Accent: `#4a7dbf` — cold blue
- Danger: `#bf5a4a` — muted red-orange, not harsh

### Glassmorphism (UI panels)
- Background: `rgba(8, 8, 20, 0.75)` to `rgba(12, 12, 24, 0.85)`
- Backdrop filter: `blur(20px)` to `blur(32px)`
- Border: `1px solid rgba(255, 255, 255, 0.07)` — barely visible
- Border radius: `16px` for panels, `8px` for inline elements
- No strong shadows — depth via blur and opacity only

---

## Typography

**Display / Hero (star names in UI, large headings):**
- Font: Space Grotesk
- Weight: 300 (light) or 700 (bold) — nothing in between
- Letter spacing: `+0.02em` for display, `+0.08em` for uppercase labels

**Body / UI:**
- Font: Inter or system sans-serif fallback
- Size scale: 11 / 13 / 15 / 18 / 24 / 36 / 56px — only these
- Maximum 3 font sizes per screen

**Code / Addresses:**
- Font: JetBrains Mono or Fira Code
- Used for: star addresses (`rai.app/@name`), API-style strings

**Rules:**
- No decorative typefaces
- No handwritten or brush fonts
- Star address in monospace always
- UI labels: uppercase, small, letter-spaced

---

## Motion

**Principle:** Motion communicates state change. Not decoration.

**Map:**
- Particle drift: 0.05–0.2 units/sec, direction varies by star type
- RA corona: slow pulse, 8s cycle, opacity 40%→70%→40%
- Planet ambient rotation: very slow (visual only, not axial)
- Star hover glow: 150ms fade-in
- Map pan: inertial, momentum ease-out
- Map zoom: ease-in-out, 300ms

**UI:**
- Panel slide-in: 280ms ease-out from right
- Glass block scroll reveal: 400ms fade-up
- Page transitions: 200ms opacity fade
- Toast: 200ms slide-right
- Loading states: 1.5s pulse loop

**Never:**
- Bounce or elastic animations
- Shake or wiggle
- Auto-rotating camera without user input
- Looping animations on idle UI elements

---

## Glassmorphism Rules

- Use only where panels float over the map or atmospheric background
- Not for every card — only for elements that genuinely float on top of the space
- Maximum 2 levels of blur depth per screen
- Lighter glassmorphism on Start Page (more transparent)
- Heavier glassmorphism on Profile and Create flow (more opaque)

---

## Surfaces and Materials (Map Rendering)

**RA:**
- `MeshStandardMaterial` with strong emissive
- Outer glow via `PointLight` and particle halo
- No texture map — pure light emission

**Planets:**
- Realistic sphere with subtle normal map or procedural shading
- Rim light from direction of RA
- Faint atmospheric edge (transparent gradient at edges)
- No cartoon textures, no flat circles

**Meta Stars:**
- `Points` geometry for the base star field
- Individual glow per star via shader or `PointLight` approximation
- Color from `atmosphereParams.primaryColor`
- Style variation from `mapMarkerStyle`

---

## Do / Don't

### DO
- Dark mode everywhere
- Breathing room between elements (minimum 24px)
- Subtle borders (1px, low opacity)
- Slow ambient motion in map canvas
- Muted palette with selective high-saturation accents
- Concise UI text (3–5 words maximum for labels)
- Consistent icon set (Lucide)

### DON'T
- Don't make the map look like a game
- Don't use neon as a primary color (accent only)
- Don't animate every element
- Don't show more than 5 interactive elements on one section of the screen
- Don't use light mode
- Don't use "metaverse" language in copy
- Don't show user avatars — only stars
- Don't put promotional content or banners in the map canvas

---

## MVP Art Direction Statement

> RAi looks like a precision instrument for observing and inhabiting a real universe.
> The interface is barely there — the space is everything.
> Every star is a genuine presence. Every interaction reinforces that this place is real.
> Dark. Precise. Alive. Yours.
