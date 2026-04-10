# RAi — Visual Reference & Art Direction

> This document sets the visual framework for the entire MVP.
> Every UI and rendering decision aligns with this document.
> When in doubt about how something should look — check here first.

---

## Visual Thesis

RAi is not a game. Not a metaverse. Not a sci-fi dashboard.

RAi is a premium editorial platform for AI intelligence. The design communicates authority, precision, and quality. Every surface exists to present work clearly. Every interaction reinforces that this is a professional research environment.

**One sentence:** RAi looks like a premium dark editorial publication platform — refined typography, generous spacing, and quiet visual confidence.

---

## Core Mood

**Premium dark editorial. Refined minimalism. Quiet authority.**

Reference in words:
- Bloomberg Terminal meets Stripe Dashboard — data-rich, precise, no decoration
- Academic journal typography — structured, authoritative, clear hierarchy
- Japanese minimalism intersected with modern SaaS design
- The New Yorker's layout discipline — every element earns its space
- Brian Eno ambient — space between elements is the design

**What this is NOT:**
- Not a cosmic/space-themed universe
- Not neon cyberpunk
- Not a game UI with HUDs and radars
- Not a portfolio builder with templates
- Not flat design with decorative illustrations
- Not a social media feed clone

---

## UI Tone

- **Instrumental, not decorative.** Every element serves a function.
- **Confident, not loud.** No animation for animation's sake.
- **Editorial, not flat.** Depth is communicated through layering, typography hierarchy, and surface elevation.
- **Dark but readable.** Dark mode only in MVP. Premium contrast.
- **Professional, not corporate.** Warm enough to feel human, structured enough to feel authoritative.

UI text tone: short, specific, no marketing hyperbole. Not "Unleash your AI potential!" — just "Publish your work."

---

## Intelligence Topology

The intelligence topology (map view in Explore) is the visual representation of the platform's knowledge network. It must feel like an abstract data visualization — not a cosmic scene.

**How it should feel:**
- You are looking at an intelligence network — connections between ideas, Domains, and research spaces
- Observatories are nodes in a network, not decorative objects
- RA at the center is the platform anchor — a hub, not a star
- Domains are cluster nodes that organize the network thematically
- The space between nodes communicates structure, not emptiness
- Zooming in should feel like focusing, not approaching

**What the topology must avoid:**
- Game minimap aesthetic
- Flat circles with labels only
- Cosmic or space imagery
- Grid or structured layout
- Harsh outlines or icon-style objects
- Loading spinners in the middle of the canvas

---

## Color Direction

### Backgrounds
- Deep base: `#030307` — deepest black with faint blue tone
- Topology canvas: `#050509`
- UI panels: `#0a0a12` to `#12121e`
- Surface elevation: `#16161f`

### RA (topology center)
- Core glow: warm white-gold `#fff4d6`
- Ambient: fading amber to transparent `rgba(255, 210, 100, 0.08)`

### Domains (topology rendering)
- Each Domain uses its own color hint (see `docs/domain-definitions.md`)
- Rendered as cluster nodes with theme-colored highlights
- Active Domains: full visual treatment
- Coming Soon Domains: muted, reduced opacity

### Observatories (topology rendering)
- Color from Domain association
- Size: based on reputation score
- Own Observatory: distinct indicator (ring or glow)

### UI Text
- Primary: `#e8edf5` — not pure white, slightly warm
- Secondary: `#8890a8` — muted, for metadata
- Accent: `#4a7dbf` — cold blue
- Danger: `#bf5a4a` — muted red-orange, not harsh
- Success: `#4abf6a` — muted green

### Surface Treatment (UI panels)
- Background: `rgba(8, 8, 20, 0.75)` to `rgba(12, 12, 24, 0.85)`
- Backdrop filter: `blur(20px)` to `blur(32px)`
- Border: `1px solid rgba(255, 255, 255, 0.07)` — barely visible
- Border radius: `16px` for panels, `8px` for inline elements
- No strong shadows — depth via blur and opacity only

---

## Typography

**Display / Hero (Observatory names, headings, publication titles):**
- Font: Space Grotesk
- Weight: 300 (light) or 700 (bold) — nothing in between
- Letter spacing: `+0.02em` for display, `+0.08em` for uppercase labels

**Body / UI:**
- Font: Inter or system sans-serif fallback
- Size scale: 11 / 13 / 15 / 18 / 24 / 36 / 56px — only these
- Maximum 3 font sizes per screen

**Code / Addresses:**
- Font: JetBrains Mono or Fira Code
- Used for: Observatory addresses (`rai.app/@name`), technical content in publications

**Rules:**
- No decorative typefaces
- No handwritten or brush fonts
- Observatory address in monospace always
- UI labels: uppercase, small, letter-spaced
- Publication body: generous line height (1.6–1.8)

---

## Motion

**Principle:** Motion communicates state change. Not decoration.

**Topology:**
- Node hover glow: 150ms fade-in
- Canvas pan: inertial, momentum ease-out
- Canvas zoom: ease-in-out, 300ms
- RA ambient: slow pulse, 8s cycle, opacity 40%→70%→40%
- Domain nodes: subtle ambient effect (visual only)

**UI:**
- Panel slide-in: 280ms ease-out from right
- Content reveal: 400ms fade-up on scroll
- Page transitions: 200ms opacity fade
- Toast: 200ms slide-right
- Loading states: 1.5s pulse loop
- Upvote micro-animation: 200–300ms ease-out

**Never:**
- Bounce or elastic animations
- Shake or wiggle
- Auto-rotating camera without user input
- Looping animations on idle UI elements

---

## Surface Rules

- Use glass/blur surfaces only where panels float over the topology canvas or ambient backgrounds
- Not for every card — only for elements that genuinely float on top of a visual background
- Maximum 2 levels of blur depth per screen
- Lighter treatment on Start Page (more transparent)
- Heavier treatment on Dashboard and creation flow (more opaque)
- Publication cards: elevated solid surfaces, not glass

---

## Topology Rendering

**RA:**
- Central hub node with warm glow
- Ambient pulse animation
- No texture — pure light emission

**Domains:**
- Cluster nodes at fixed positions
- Theme-colored with subtle glow
- Active: full visual presence
- Coming Soon: muted, reduced opacity, subtle "Coming Soon" label

**Observatories:**
- Nodes distributed across the topology
- Color from Domain association
- Size influenced by reputation score
- Own Observatory: highlighted with distinct ring or glow indicator
- Hover: tooltip with name, type, publication count

---

## Do / Don't

### DO
- Dark mode everywhere
- Breathing room between elements (minimum 24px)
- Subtle borders (1px, low opacity)
- Premium editorial typography
- Muted palette with selective high-saturation accents
- Concise UI text (3–5 words maximum for labels)
- Consistent icon set (Lucide)
- Generous line height in publication content
- Clean structured layouts for data presentation

### DON'T
- Don't make the topology look like a game or cosmic scene
- Don't use neon as a primary color (accent only)
- Don't animate every element
- Don't show more than 5 interactive elements on one section of the screen
- Don't use light mode
- Don't use cosmic or space language in copy
- Don't use "metaverse" language in copy
- Don't put promotional content or banners in the topology canvas
- Don't use decorative illustrations or icons

---

## MVP Art Direction Statement

> RAi looks like a premium editorial platform for intelligence.
> The interface presents work clearly — the content is everything.
> Every Observatory is a research identity. Every publication is evidence.
> Dark. Precise. Professional. Earned.
