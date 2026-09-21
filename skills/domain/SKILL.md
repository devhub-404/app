---
name: domain
description: "Use only when defining or changing domain entities, invariants, state transitions, or business rules in a module or feature."
---

# Domain

Identify the owner of each fact, invariant, state, and transition before
editing. Keep business rules independent from HTTP, persistence, framework
decorators, and UI. Make invalid states unrepresentable or reject them at the
domain boundary.

For every mutation, define valid inputs, allowed transitions, ownership,
idempotency, terminal states, and authorization facts required by the rule.
Keep derived projections distinct from source-of-truth state. Do not move a
rule into a controller, repository, API client, or component because it is
convenient there.

In Web feature domains, limit the layer to local presentation rules; API
domains remain authoritative for product rules. Preserve the existing
`spec.md` and update it when a normative rule intentionally changes.

Verify with domain tests and affected use-case tests. This skill does not
design orchestration, transport DTOs, queries, or visual behavior.
