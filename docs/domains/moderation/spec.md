# Moderation

Status: current

## Purpose

Apply capability restrictions and visibility interventions to accounts and
content without taking ownership of the moderated resource.

## Business rules

- A restriction is a capability barrier; it never grants authority.
- Restricted capabilities are `CONTRIBUTION`, `COMMENT`, `VOTE`, and
  `JOB_PUBLISH`.
- A restriction has a start, may have an end, records who applied it, and may
  be revoked once with an actor and reason.
- Restriction effectiveness considers revocation and the time window.
- Each capability owner applies its own barrier before mutation.
- Hiding and showing again are moderation interventions orthogonal to the
  editorial lifecycle of owners that support the capability.
- Moderation does not transfer ownership or replace the public contracts of
  article, project, job, question, answer, comment, or resource owners.
- Only moderation authority may apply or revoke restrictions, hide or show
  resources, and query hidden targets.

## Capabilities

- View an account's standing.
- Apply and revoke a capability restriction.
- Hide and show supported resources and comments.
- List currently hidden targets for moderation management.
