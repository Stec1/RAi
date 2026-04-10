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
| 5 | Explore | `/explore` | No (browse), Yes (upvote) |
| 6 | Create Observatory | `/create` | Yes |
| 7 | Control Panel | `/dashboard` | Yes |
| 8 | Systems Management | `/dashboard/systems` | Yes |
| 9 | Publications Management | `/dashboard/publications` | Yes |
| 10 | Publish | `/dashboard/publish` | Yes |
| 11 | Visual Signature | `/dashboard/visual` | Yes |
| 12 | Observatory Public Page | `/observatory/:name` | No |
| 13 | Publication Page | `/publication/:id` | No |
| 14 | Settings | `/dashboard/settings` | Yes |
| 15 | Privacy Policy | `/privacy` | No |
| 16 | Terms of Service | `/terms` | No |

---

## Screen 1 — Start Page

**Route:** `/`
**Auth required:** No

**Purpose:**
First public contact with RAi. Communicates what RAi is within seconds. Premium dark editorial landing page that drives users toward registration.

**Primary components:**
- Transparent top bar: RAi logo (clickable → About), Log in, Get Started
- Full-screen premium dark editorial background
- Scrollable narrative sections:
  - What is RAi
  - How it works (publish → prove → get discovered)
  - Domain showcase (active Domains with themes)
  - CTA to create Observatory
- Footer with links (About, Privacy Policy, Terms)

**Key actions:**
- Click "Get Started" → `/signup`
- Click "Log in" → `/login`
- Click "RAi" in nav → `/about`
- Scroll → reveals content sections progressively

---

## Screen 2 — About

**Route:** `/about`
**Auth required:** No

**Purpose:**
Full readable description of the RAi platform. Informational space for users who want to understand the product in depth before registering.

**Primary components:**
- Full description of RAi: Domains, Observatories, publications, reputation
- Platform structure overview
- Product vision and narrative
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
- Premium dark editorial background
- Centered card:
  - RAi logo
  - Tagline: "Don't describe your AI. Prove it."
  - Email + password fields
  - "Log in" button
  - Google OAuth button
  - Link to `/signup`

**Key actions:**
- Submit email/password → authenticate → redirect to `/dashboard` (if Observatory exists) or `/create` (if not)
- Google OAuth → authenticate → same redirect logic
- Click "Get Started" → `/signup`

---

## Screen 4 — Get Started

**Route:** `/signup`
**Auth required:** No

**Purpose:**
New user registration. After successful registration, redirect to `/create` (first Observatory creation).

**Primary components:**
- Same card layout as Login
- Email + password fields (with confirmation)
- Google OAuth button
- Display name field (optional, editable later)
- Link back to `/login`

**Key actions:**
- Register → if no Observatory → `/create`
- Register → if has Observatory (edge case) → `/dashboard`
- Google OAuth → same redirect logic

---

## Screen 5 — Explore

**Route:** `/explore`
**Auth required:** No for browsing, Yes for upvoting

**Purpose:**
The main discovery screen. Three views for finding Observatories, publications, and understanding the platform topology.

**Primary components:**

**Top navigation bar (transparent, floating):**
- RAi (logo, always visible)
- Domains (nav item)
- Observatories (nav item)
- Burger menu → Dashboard, Settings, Log out (if authed)

**View switcher:**
- Feed (default) / Observatories / Map

**Feed view:**
- Vertical stream of publication cards
- Each card: title, Observatory name, System name, date, summary, upvote count
- Domain filter pills (active Domains only)
- Sort toggles: trending / newest / top
- Pagination (infinite scroll or page numbers)

**Observatories view:**
- Ranked list of Observatories by reputation
- Each card: name, type badge, Domain badges, reputation score, publication count
- Domain filter pills
- Sort toggles: reputation / newest / most publications

**Map view (intelligence topology):**
- Full-screen abstract network visualization
- RA at center
- 7 Domains at fixed positions (3 active, 4 Coming Soon — visually distinct)
- Observatories as nodes with Domain color association
- Node size based on reputation score
- Own Observatory highlighted with distinct indicator (if authed)
- Mini-map in bottom-right corner

**Slide-in info panels (triggered by nav clicks or map object clicks):**
- RA panel: About RAi text, platform stats
- Domains panel: list of active Domains with themes and counts
- Domain detail panel: Domain name, description, associated Observatories
- Observatories panel: ranked list + "Create Observatory" CTA
- Observatory preview panel: name, type, reputation, "View Observatory →"

**Search:**
- Full-text search across Observatory names, bios, systems, publication titles
- Search bar in top nav area

**Key actions:**
- Switch views: Feed / Observatories / Map
- Filter by Domain
- Sort by trending / newest / top
- Search
- Click publication card → `/publication/:id`
- Click Observatory card → `/observatory/:name`
- Upvote publication (if authed)
- Click "Create Observatory" → `/create`
- Hover/click map objects → info panels

---

## Screen 6 — Create Observatory

**Route:** `/create`
**Auth required:** Yes
**Redirect if Observatory exists:** `/dashboard`

**Purpose:**
3-step flow for creating an Observatory. The first time a creator defines their research identity on RAi.

### Step 1 — Identity
- Observatory name input (permanent, unique) with real-time availability check
- Live address preview: `rai.app/@name`
- Display name input (pre-filled from account, changeable later)
- Bio field (max 160 chars, character counter)
- Domain association: pill selector for 1–2 active Domains (optional)
- Social links (GitHub, X, Telegram, LinkedIn, email, website)
- Observatory type selector: individual / studio / product

### Step 2 — First Publication
- "Paste your agent's latest output. RAi will format it."
- Raw content textarea
- System selection (optional — can skip, no systems registered yet)
- RAi AI formats content: title, summary, key findings, formatted body
- Creator reviews and edits all fields
- Domain and tags selection
- Publish (1 credit) or save as draft

### Step 3 — Visual Signature (optional)
- "Make your Observatory visually unique."
- AI prompt textarea
- Generate button → Visual Signature preview
- Can be skipped — default Visual Signature assigned based on Domain
- Post-creation redirect: `/dashboard`

---

## Screen 7 — Control Panel (Dashboard)

**Route:** `/dashboard`
**Auth required:** Yes

**Purpose:**
The owner's management interface for their Observatory. Central hub for all management actions.

**Primary components:**
- Observatory card: name, address, type badge, Domain badges, Visual Signature visual, reputation score
- Metrics: Total Visitors, Publication Views, Total Upvotes
- Plan badge: Free / Pro
- Credits section: current balance + "Top up →" link
- Quick actions:
  - Edit Identity (name, bio, social links, Domain association)
  - Manage Systems → `/dashboard/systems`
  - New Publication → `/dashboard/publish`
  - Visual Signature → `/dashboard/visual`
  - Settings → `/dashboard/settings`

---

## Screen 8 — Systems Management

**Route:** `/dashboard/systems`
**Auth required:** Yes

**Purpose:**
Register and manage AI systems associated with the Observatory.

**Primary components:**
- List of registered Systems as structured proof cards
- Each card: name, type badge, status dot, capabilities pills, external URL link
- "Register System" button → form modal or inline form
- System form: name, type (agent/workflow/tool/service), description, capabilities tags, status (active/demo/concept), external URL
- Edit and delete actions per system
- Free tier limit indicator (3 systems max)

**Key actions:**
- Register new System
- Edit existing System
- Delete System (with confirmation)

---

## Screen 9 — Publications Management

**Route:** `/dashboard/publications`
**Auth required:** Yes

**Purpose:**
View and manage all publications (published and drafts).

**Primary components:**
- List of publications sorted by date
- Each card: title, status badge (published/draft), date, System attribution, upvote count
- Filter: all / published / drafts
- Click card → edit view
- "New Publication" button → `/dashboard/publish`

**Key actions:**
- View publication list
- Edit existing publication
- Navigate to create new publication

---

## Screen 10 — Publish

**Route:** `/dashboard/publish`
**Auth required:** Yes

**Purpose:**
Create and format a new publication.

**Primary components:**
- System selector (optional — select from registered systems)
- Raw content textarea: "Paste your agent's output here"
- "Format with AI" button → BullMQ job → SSE progress
- Preview of formatted output: title, summary, key findings, body
- All fields editable by creator
- Domain selector
- Tags input
- Capabilities demonstrated (auto-suggested from system capabilities)
- Credit check indicator
- "Publish" button (costs 1 credit) / "Save as Draft" button

**Key actions:**
- Paste raw content
- Format with AI
- Edit formatted fields
- Publish or save as draft

---

## Screen 11 — Visual Signature

**Route:** `/dashboard/visual`
**Auth required:** Yes

**Purpose:**
Generate and manage the Observatory's Visual Signature.

**Primary components:**
- Current Visual Signature preview
- AI prompt textarea
- "Generate" button → BullMQ job → SSE progress → preview update
- Credits required indicator (2 credits per generation)
- Rollback: list of up to 3 previous Visual Signatures with "Restore" button (1 credit)
- Rate limit indicator (10 generations/hour)

**Key actions:**
- Write prompt → generate Visual Signature
- Rollback to previous version
- Preview current Visual Signature

---

## Screen 12 — Observatory Public Page

**Route:** `/observatory/:name`
**Auth required:** No

**Purpose:**
Public page for any Observatory. What visitors see when following a shared link. The premium research identity.

**Primary components:**
- Hero zone: Visual Signature ambient field, Observatory name (large typography), type badge, reputation metrics, social links
- Systems section: structured proof cards on elevated surface
- Publications section: vertical stack of publication cards (title, date, System, summary, upvote count)
- Footer: social links, contact CTA
- Share button → copy link + toast

**OG image:** Generated via `@vercel/og` at `/api/og?name=[name]`, 1200×630, Observatory name + Visual Signature colors + type.

---

## Screen 13 — Publication Page

**Route:** `/publication/:id`
**Auth required:** No (viewing), Yes (upvoting)

**Purpose:**
Standalone page for a single publication. Full formatted presentation of the work.

**Primary components:**
- Publication title (large typography)
- Observatory attribution: name, link to Observatory page
- System attribution: name, type badge (if linked)
- Published date
- Domain badge and tags
- Summary
- Key findings (structured list)
- Methodology (if provided)
- Full formatted body
- Capabilities demonstrated pills
- Upvote button with count
- Share button → copy link + toast
- "View Observatory →" link

**OG image:** Generated via `@vercel/og`, 1200×630, publication title + Observatory name.

---

## Screen 14 — Settings

**Route:** `/dashboard/settings`
**Auth required:** Yes

**Purpose:**
User account settings. Separate from Observatory settings (which live in Control Panel).

**Primary components:**
- Email change
- Password change
- Notification preferences
- Toggle Observatory Public / Private
- Plan management link → Stripe Customer Portal
- Account deletion (with confirmation)

---

## Screen 15 — Privacy Policy

**Route:** `/privacy`
**Auth required:** No

**Purpose:**
Standard privacy policy page required for launch.

---

## Screen 16 — Terms of Service

**Route:** `/terms`
**Auth required:** No

**Purpose:**
Standard terms of service page required for launch.
