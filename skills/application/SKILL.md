---
name: application
description: "Use only when changing API use cases, commands, queries, policies, ports, projections, or orchestration of a module operation."
---

# Application

Keep the application layer responsible for coordinating an operation: accept
input, call ports or public contracts, apply contextual authorization, manage
transactions when required, and return an explicit output projection.

Commands mutate; queries read and project. Policies decide contextual access
without replacing domain invariants. Ports describe required capabilities and
must not expose adapter details. A use case may coordinate modules only
through their public contracts.

Keep transport adaptation in presentation and persistence/provider details in
infrastructure. Do not duplicate domain rules or let a repository become the
use-case owner. Preserve idempotency, error semantics, and transaction
boundaries.

Verify with focused tests for success, invalid state, authorization,
idempotency, and orchestration effects. This skill does not define DTO
decorators or database query optimization.
