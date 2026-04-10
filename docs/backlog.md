# RAi — Backlog

> Items that surfaced during development but are not in the current issue scope.
> Nothing here is implemented without a dedicated GitHub issue and founder decision.
>
> Rule: If an idea appears during ISSUE-X, it goes here. Not into the current PR.

---

## How to Use This File

1. Add new items with a short description and the issue where the idea surfaced.
2. Do not assign priority or timeline — that happens during weekly review.
3. Items that graduate to active development get a new GitHub issue and are removed from this list.

---

## Items

### From ISSUE-00 (Documentation Rewrite)

- **VisualSignature parameter finalization** — The `VisualSignature` type in `docs/architecture.md` defines 8 parameters (primaryColor, secondaryColor, gradientAngle, ambientEffect, effectIntensity, surfaceStyle, accentColor, nodeStyle). These are provisional and should be validated during ISSUE-18 implementation. The exact parameter set may need adjustment based on what GPT-4o can reliably generate and what produces visually meaningful differences.

- **Reputation formula tuning** — The reputation scoring formula in DL-22 is a first approximation. After soft launch, analyze actual score distribution and adjust weights to ensure meaningful differentiation between Observatories.

- **Coming Soon Domain activation criteria** — `docs/domain-definitions.md` states Domains activate when "sufficient creator density justifies activation." The exact threshold (proposed: 20 Observatories per active Domain) should be confirmed before the first Domain activation.
