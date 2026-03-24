# RAi — Screens Specification

> Short spec for every MVP screen.
> Describes purpose, primary components, and key user actions.
> This is the app map. Not a design spec — a structural reference.

---

## Screen List

| # | Screen | Route | Auth required |
|---|---|---|---|
| 1 | Start Page | `/` | No |
| 2 | About | `/about` | No |
| 3 | Login | `/login` | No |
| 4 | Get Started | `/signup` | No |
| 5 | Explore | `/explore` | Yes |
| 6 | Create Your Meta | `/create` | Yes |
| 7 | Profile | `/profile` | Yes |
| 8 | Public Star Preview | `/star/:name` | No |
| 9 | Settings | `/settings` | Yes |

---

## Screen 1 — Start Page

**Route:** `/`
**Auth required:** No

**Purpose:**
First public contact with RAi. Communicates what RAi is within seconds. Serves as an animated narrative landing page that draws users toward registration.

**Primary components:**
- Transparent glassmorphism top bar: RAi logo (clickable → About), Log in, Get Started
- Full-screen atmospheric background (cosmic, static or subtle animation)
- Scrollable narrative with glass content blocks:
  - What is RAi
  - What is a Meta Star
  - What are Planets
  - Why it matters
- Animated roadmap section
- Footer with links

**Key actions:**
- Click "Get Started" → `/signup`
- Click "Log in" → `/login`
- Click "RAi" in nav → `/about`
- Scroll → reveals glass content blocks progressively

---

## Screen 2 — About

**Route:** `/about`
**Auth required:** No

**Purpose:**
Full readable description of the RAi ecosystem. Informational space for users who want to understand the product in depth before registering.

**Primary components:**
- Full description of RA, Planets, Satellites, Meta Stars
- World structure overview
- Product vision
- Back navigation to Start Page

**Key actions:**
- Read
- Click "Get Started" → `/signup`

---

## Screen 3 — Login

**Route:** `/login`
**Auth required:** No

**Purpose:**
Authentication screen for returning users.

**Primary components:**
- Atmospheric background (distinct from Start Page)
- Centered glass card:
  - RAi logo
  - Slogan: "Claim your place in the universe."
  - Email + password fields
  - "Log in" button
  - Google OAuth button
  - Link to `/signup`

**Key actions:**
- Submit email/password → authenticate → redirect to `/explore`
- Google OAuth → authenticate → redirect to `/explore`
- Click "Get Started" → `/signup`

---

## Screen 4 — Get Started

**Route:** `/signup`
**Auth required:** No

**Purpose:**
New user registration. After successful registration, if the user has no Meta Star, redirect to `/create`. Otherwise redirect to `/explore`.

**Primary components:**
- Same glass card layout as Login
- Email + password fields (with confirmation)
- Google OAuth button
- Display name field (temporary, editable later)
- Link back to `/login`

**Key actions:**
- Register → if no Meta Star → `/create`
- Register → if has Meta Star (edge case) → `/explore`
- Google OAuth → same redirect logic

---

## Screen 5 — Explore

**Route:** `/explore`
**Auth required:** Yes

**Purpose:**
The main home screen after login. The living meta-universe map. Enables discovery of Planets, Meta Stars, and provides the CTA to create a Meta Star.

**Primary components:**
- Transparent top navigation bar:
  - RAi (logo, always visible)
  - Planets (nav item)
  - Satellites (nav item)
  - Meta Stars (nav item)
  - Burger menu → Profile, Settings, Log out
- Full-screen interactive WebGL map:
  - RA at center
  - 7 Planets at fixed positions
  - Satellite objects near Planets (visual only)
  - Meta Stars as colored glow points
  - Own Meta Star highlighted with ring
- Mini-map in bottom-right corner
- Slide-in info panels (triggered by nav clicks or map object clicks)
- "Create your meta" CTA visible in Meta Stars panel

**Key actions:**
- Hover Planet on map → highlight associated Meta Stars
- Click Planet on map → open Planet info panel
- Click nav item → open corresponding info panel
- Click Meta Star on map → open Star preview panel or navigate to `/star/:name`
- Click "Create your meta" → `/create`
- Burger menu → Profile / Settings / Log out

---

## Screen 6 — Create Your Meta

**Route:** `/create`
**Auth required:** Yes
**Redirect if star exists:** `/profile`

**Purpose:**
3-step flow for creating a Meta Star. The first time a user defines their identity in the RAi meta-universe.

### Step 1 — Identity
- Star name input (permanent, unique) with real-time availability check
- Live address preview: `rai.app/@name`
- Display name input (changeable later)
- Bio field (max 160 chars)
- Planet association: optional selection of 1–2 Planets (pill selector)

### Step 2 — Atmosphere
- Star type selector: Cold / Warm / Binary / Dim / Giant
- AI prompt textarea: "Describe your space in 2–3 sentences"
- Starter prompt chips (no credit cost)
- Generate button → BullMQ job → SSE progress
- Live preview: how the star will appear on the map
- Credit deduction after successful generation

### Step 3 — Visibility
- Public / Private toggle with explanation
- Full summary: name, address, type, planet association, atmosphere preview
- "Launch Your Star" CTA

**Post-launch redirect:** `/profile`

---

## Screen 7 — Profile

**Route:** `/profile`
**Auth required:** Yes

**Purpose:**
Ownership dashboard. The control panel for the user's Meta Star. Evokes a sense of control over one's own world.

**Primary components:**
- Meta Star card: name, address, type badge, planet badges, atmosphere visual
- Metrics: Total Visitors, This Week, Credits balance
- Plan badge: Free / Pro
- Quick actions:
  - Edit Atmosphere (→ AI Generator overlay)
  - Edit Info (name, bio, planet association)
  - Toggle Public / Private
  - Share
- Credits section: balance display, "Top up →" link
- Share block: copy public link
- "Connect Wallet" label: shown as "Coming soon" — no functionality in MVP

---

## Screen 8 — Public Star Preview

**Route:** `/star/:name`
**Auth required:** No

**Purpose:**
Public page for any Meta Star. What visitors see when following a shared link. Also functions as the OG image source for social sharing.

**Primary components:**
- Atmospheric background render (static version of the star's atmosphere)
- Star name (large, prominent)
- Address: `rai.app/@name`
- Type badge
- Planet badges
- Bio text
- Visitor count
- "Enter Universe" CTA → redirect to `/explore` focused on this star
- Share button → copy link + toast

**OG image:** Generated via `@vercel/og`, 1200×630, star name + atmosphere colors + type.

---

## Screen 9 — Settings

**Route:** `/settings`
**Auth required:** Yes

**Purpose:**
User account settings. Separate from Meta Star settings (which live in Profile).

**Primary components:**
- Email change
- Password change
- Notification preferences
- Account deletion (with confirmation)
- Plan management link → Stripe Customer Portal
