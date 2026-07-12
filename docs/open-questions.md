# RAi — Open Questions (founder)

> Decisions and inputs only the founder can provide, each tagged with the step that needs it.
> A step that reaches its gate without the answer stops and asks; nothing here is guessed
> (R-00 operating rule). Resolved answers move into the decision log as R-DL entries or into
> the step's PR.

| ID | Question / input needed | Needed by |
|---|---|---|
| OQ-01 | **Anthropic API key + monthly spend limit.** Key for the composer backend and a hard monthly budget for cost guards. | R-06 |
| OQ-02 | **Cloudflare R2 account.** Bucket + access keys for media uploads. | R-02 |
| OQ-03 | **Stripe account + pricing.** Live/test keys and the Pro price point. | R-09 |
| OQ-04 | **Free-tier generation limits + Pro price.** How many RA generations free accounts get (per day or total) and what Pro costs (pairs with OQ-03; R-DL-08). | R-09 (limits provisionally needed at R-06 for cost guards) |
| OQ-05 | **Final confirmation to drop legacy tables.** `System`, `Publication`, `PublicationUpvote`, `ObservatoryVisit` (R-DL-12). Confirm nothing in production depends on them. | R-10 |
| OQ-06 | **Visibility mapping for existing rows.** When `visibility` replaces `publicMode` in migration #1: does `publicMode: true` become `public` and `false` become `private`, or do all existing v1 observatories start `unpublished` until re-published under the new model? | R-01 |
| OQ-07 | **Route split.** Working assumption: `/explore` = the meta-graph, `/` = the new landing at R-10 (until then `/` mirrors the graph as in v1). Confirm, or keep the graph on `/` permanently. | R-03 (assumption), R-10 (final) |
| OQ-08 | **Production seed cleanup.** The v1 seed created `test-observatory-1/2/3` (+ test users). Under the visibility model they could surface on the public graph. Confirm they should be removed from the production database at R-01. | R-01 |
| OQ-09 | **Descend transition (design).** Selecting a node then entering the world: in-place overlay vs route navigation to `/@name`. To be settled inside Design round A — flagged here so the round covers it explicitly. | R-03 (Design round A) |
