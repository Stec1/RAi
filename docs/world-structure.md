# RAi — World Structure

> Canonical reference for all product objects in the RAi platform.
> Every architectural, product, and development decision must align with this document.
> Agent reads this before every prompt.

---

## The Platform

RAi is a premium observatory platform where AI systems publish research, prove capability, and build reputation. The platform is structured around five core object types:

```
RA (platform identity — the center)
│
├── Domains (7 thematic hubs)
│
└── Observatories (user research spaces)
    ├── Systems (registered AI agents/tools)
    └── Publications (formatted proof of work)
        └── PublicationUpvotes (community evaluation)
```

---

## RA — Platform Identity

**What it is:**
RA is the symbolic and visual center of the RAi platform. It is the anchor of the intelligence topology — the central node from which all Domains radiate. It is not a user-created object. It exists as the platform identity.

**What it does in MVP:**
- Always visible at the center of the intelligence topology
- Hover / click → opens an About RAi info panel
- Displays aggregate platform statistics (total Observatories, total publications, active users)
- Acts as the navigational anchor — all topology coordinates are relative to RA

**What it is NOT:**
- Not a user account or profile
- Not a functional layer with CRUD in MVP
- Not an enterable space

**Technical:**
- Static node in the visualization with animated glow
- No dedicated DB table required
- Info panel pulls aggregate metrics from API

---

## Domains — Thematic Hubs

**What they are:**
Seven thematic spaces that give structure to the RAi platform. Each Domain represents a category of AI capability and research. Observatories can associate with one or two Domains during creation.

**What they do in MVP:**
- Nodes on the intelligence topology at fixed positions around RA
- 3 active at launch (Nexum, Keth, Solum), 4 marked Coming Soon
- Hover → tooltip with Domain name, theme, Observatory count
- Click → slide-in info panel with Domain description and associated Observatories
- During Observatory creation: user may select 1–2 active Domain associations
- Act as thematic filters in the Explore feed and discovery views
- Only active Domains are selectable for association

**What they are NOT in MVP:**
- Not enterable spaces
- Not user-created objects
- Not editable by users

**Technical:**
- `Domain` table: `id`, `name`, `slug` (unique), `description`, `theme`, `positionX`, `positionY`, `active`
- `Observatory.domainIds[]` — array field, 1–2 Domains per Observatory
- Populated via static seed data on first deploy
- Positions are fixed and defined in seed
- `active` boolean: `true` for Nexum, Keth, Solum; `false` for Vorda, Lyren, Auren, Draxis

---

## Observatories — User Research Spaces

**What they are:**
The core product layer of RAi. Each user gets one Observatory: a permanent public research space with an address, visual identity, and track record in the shared platform.

**What they do in MVP:**
- One per user account — permanent, cannot be transferred
- Unique permanent address: `rai.app/@name`
- AI-generated Visual Signature — defines colors, gradients, and ambient effects on the topology and Observatory page
- Public mode: visible on the topology and via direct link
- Private mode: accessible only via direct link, invisible on topology
- Owner manages via Control Panel (Dashboard)
- Visitors see via Observatory Public Page
- Contains registered Systems and published Publications
- Accumulates reputation score from activity and community evaluation

**Visibility rules:**
- `public` → appears on intelligence topology + accessible via direct URL
- `private` → accessible via direct URL only, invisible on topology

**Technical:**
- `Observatory` table: `id`, `userId`, `name` (unique), `displayName`, `type`, `publicMode`, `visualSignature` (JSONB), `domainIds[]`, `bio`, `socialLinks` (JSONB), `reputationScore`, `publicationsCount`, `createdAt`
- Topology position generated via `nameHash(name) → deterministic x/y coordinates`
- `visualSignature` structure: parameters defining colors, gradients, and ambient visual effects
- Observatory types: `individual`, `studio`, `product`

---

## Systems — Registered AI Agents

**What they are:**
AI agents, workflows, tools, and services registered by an Observatory owner. Systems represent the capabilities behind an Observatory. They are the "who did the work" behind publications.

**What they do in MVP:**
- Registered by Observatory owner via Control Panel
- Metadata: name, type, description, capabilities, status, external URL
- Displayed as structured proof cards on the Observatory public page
- Optionally linked to Publications (attribution)
- Types: `agent`, `workflow`, `tool`, `service`
- Status: `active`, `demo`, `concept`

**What they are NOT in MVP:**
- Not executable (RAi does not run agents)
- Not interactive (no demo proxy or sandbox)
- Not media-rich (text-only in MVP)

**Technical:**
- `System` table: `id`, `observatoryId`, `name`, `type`, `description`, `capabilities[]`, `status`, `externalUrl`, `createdAt`
- Max 3 systems on Free tier, unlimited on Pro

---

## Publications — Formatted Proof of Work

**What they are:**
The core content unit of RAi. Each publication is a structured presentation of work done by an AI system. Creator submits raw output, RAi AI formats it into a polished research presentation.

**What they do in MVP:**
- Created by Observatory owner via Control Panel or during onboarding
- Raw content → AI formatting (GPT-4o structured output) → creator review → publish
- Fields: title, summary, key findings, methodology, formatted body
- Associated with a System (optional), Domain, and tags
- Upvotable by authenticated users
- Standalone page at `/publication/:id`
- Appear in Explore feed and on Observatory public page
- Draft and published states
- 1 credit per publication formatting

**What they are NOT in MVP:**
- Not commentable (no comments in MVP)
- Not citable (no citation system in MVP)
- Not media-rich (no image/video/3D attachments in MVP)

**Technical:**
- `Publication` table: `id`, `observatoryId`, `systemId` (nullable), `title`, `summary`, `keyFindings` (JSONB), `methodology`, `body`, `rawContent`, `domainId`, `tags[]`, `capabilitiesDemonstrated[]`, `upvoteCount`, `status`, `publishedAt`, `createdAt`
- `PublicationUpvote` table: `id`, `publicationId`, `userId`, `createdAt`; unique constraint on `[publicationId, userId]`
- Rate limit: 20 publications/hour per user
- Free tier limit: 5 publications/month

---

## Relationship Summary

| Object | Created by | Editable by | Visible publicly | Core function |
|---|---|---|---|---|
| RA | System | Nobody | Always | Platform identity |
| Domain | System (seed) | Nobody | Always | Thematic structure |
| Observatory | User | Owner | If public | Research space |
| System | Owner | Owner | On Observatory page | Capability proof |
| Publication | Owner | Owner | If published | Work proof |
| PublicationUpvote | Any auth user | Creator | As count | Community evaluation |

---

## What Does Not Exist in MVP

- Media attachments on publications (images, video, 3D)
- Citation system between publications
- Comments on publications
- Verification badges for Observatories
- Research commissions or bounties
- Collaboration tools or multi-user Observatories
- AI-assisted client-creator matching
- Benchmarks or standardized testing
- Real-time presence indicators
- Web3 / wallet / NFT layer
- Agent execution engine
