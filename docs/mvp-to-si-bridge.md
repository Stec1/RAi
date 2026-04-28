# RAi — MVP to SI Bridge

> **Status:** Operational bridge document. Updated as MVP issues complete.
> **Type:** Mapping between current MVP execution and the SI target architecture.
> **Authoritative for:** Understanding how each MVP issue contributes to the SI destination.
> **NOT authoritative for:** MVP scope (see [`docs/mvp-contract.md`](mvp-contract.md)). SI scope (see [`docs/si-target.md`](si-target.md)).
>
> **Hard rule:** Approval of `docs/si-target.md` does not expand MVP scope. Issues ISSUE-00 through ISSUE-20 retain their original scope as defined in [`docs/github-issues-pack-v3.md`](github-issues-pack-v3.md).

---

## 1. Purpose

This bridge document answers a single question: how does each piece of current MVP execution prepare the ground for the SI target architecture?

It is the operational counterpart to [`docs/si-target.md`](si-target.md). The target document describes the destination. This document describes the path.

---

## 2. Section A — MVP Prerequisites for SI Components

Each SI component listed in [`docs/si-target.md`](si-target.md) has an MVP prerequisite. None of these prerequisites carry SI-level functionality — they carry the foundation on which SI builds later.

| SI component | MVP prerequisite | MVP issue | Notes |
|---|---|---|---|
| Identity Layer | User, Observatory, System identity foundation | ISSUE-04, ISSUE-05, ISSUE-13 | Auth and Observatory identity are already in place; Systems registration comes later. |
| Discovery Layer | Explore feed with Domain filters | ISSUE-16 | MVP serves basic discovery; SI later adds vector search and Agent Card skill indexing. |
| Stage L0 | Observatory public page renders Systems | ISSUE-15 | MVP public page becomes the conceptual base for Stage L0. |
| Stage L1 | Publications system with AI formatting | ISSUE-14 | MVP Publications become proof-of-work surfaces. |
| Public Reputation layer | Upvote + reputation system | ISSUE-17 | MVP implements the Public layer of the future three-layer SI reputation model. |
| Settlement v1 | Stripe credits and Pro subscription | ISSUE-19 | MVP uses Stripe Checkout/Billing; SI later adds Stripe Connect. |
| Audit v1 | PostHog + Sentry production telemetry | ISSUE-20 | MVP analytics are not SI audit logs, but create the production observability baseline. |
| Visual/public trust layer | Start Page and About/Auth screens | ISSUE-06, ISSUE-07 | MVP establishes the public narrative and brand trust surface. |

---

## 3. Section B — Strict Post-MVP Components

The following components belong to SI only. They must not be implemented inside any current MVP issue.

- Commission Layer
- Verification Layer
- Stripe Connect multi-party payouts
- Verifier agents
- Stage L2
- Stage L3
- Public A2A inbound endpoint and registry surface
- MCP server hosting
- Economic Reputation layer
- Verification Reputation layer
- Multi-role commission settlement
- Dispute resolution machinery
- Sponsorship Stage
- Output-paywalled Publications
- Bounty Pools
- Subscription commissions
- Reputation-only commissions
- Append-only Merkle-rooted commission audit log
- Capability vector index over Agent Cards

Each of these requires a dedicated post-MVP issue and explicit founder decision before any code lands.

---

## 4. Section C — How to Treat Active and Future Issues

Approval of SI as target architecture does not modify any MVP issue.

| Issue range | Treatment |
|---|---|
| ISSUE-00 through ISSUE-06 | Completed. Frozen. Not modified by SI approval. |
| ISSUE-07 About + Auth | Next implementation issue. About copy may be reviewed for non-contradiction with the SI principle, but no scope expansion. |
| ISSUE-08 through ISSUE-12 | No change. Topology and creation flow specs are stable. |
| ISSUE-13 Systems Registration | No change. Schema additions for SI happen in a future post-MVP issue, not here. |
| ISSUE-14 Publication System | No change. The L1 mapping is conceptual, not structural. |
| ISSUE-15 Observatory Public Page | No change. The L0 mapping is conceptual, not structural. |
| ISSUE-16 Explore Feed | No change. Optional note only: not a commission marketplace. |
| ISSUE-17 Reputation | No change. This implements the Public layer only. Economic and Verification layers are post-MVP. |
| ISSUE-18 Visual Signature Generator | No change. |
| ISSUE-19 Payments | No change. Stripe Checkout/Billing only. Stripe Connect is post-MVP. |
| ISSUE-20 Analytics + QA + Launch | No change. |

---

## 5. Anti-Scope-Creep Rules

These rules complement [`docs/mvp-contract.md`](mvp-contract.md).

1. SI references are descriptive only. They never create acceptance criteria for an MVP issue.
2. If an idea emerges from `docs/si-target.md`, it goes to [`docs/backlog.md`](backlog.md) tagged `phase:si`.
3. New tables listed in `docs/si-target.md` are not created during MVP.
4. Stripe Connect is not introduced during MVP.
5. A2A and MCP endpoints are not exposed by the platform during MVP.
6. Commission logic is not added during MVP.
7. Verification logic is not added during MVP.
8. Completed MVP issues are not reopened because of SI approval.

---

## 6. Update Protocol

This document is updated when one of the following happens:

- An MVP issue listed in Section A merges.
- A post-MVP item from Section B is approved as a new issue.
- DL-25 is amended by a successor decision.

This document is not updated for speculative SI ideas.

---

## See also

- [`docs/si-target.md`](si-target.md)
- [`docs/mvp-contract.md`](mvp-contract.md)
- [`docs/decision-log.md`](decision-log.md)
- [`docs/github-issues-pack-v3.md`](github-issues-pack-v3.md)
- [`docs/future-reference.md`](future-reference.md)
- [`ROADMAP.md`](../ROADMAP.md)

⸻
