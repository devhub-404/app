# Discovery

Status: current

## Purpose

Project eligible resources to help developers find knowledge and next steps
without taking ownership of the projected facts.

## Business rules

- Feed, recent, trending, popular, related, and search are distinct
  projections; discovery is neither a content owner nor a social timeline.
- Only resources eligible according to their owners participate in exposure.
- Follow is an explicit preference and may prioritize followed tags in the
  feed; having no follows does not leave the feed empty and uses a public
  fallback.
- Popular uses aggregated positive-vote signals; trending uses recent public
  activity with decay; recent uses recency; related uses tags and textual
  proximity; search preserves groups when scores are not comparable.
- Views represent reach. Bookmarks and comments do not form a universal
  engagement score.
- Ordering and exposure do not change a resource's ownership, validity, or
  quality.
- Related receives `resourceId`; its type is resolved through the identity
  contract.

## Capabilities

- Search eligible content.
- Obtain a personalized feed or public fallback.
- List recent, popular, and trending content.
- Query related content.
