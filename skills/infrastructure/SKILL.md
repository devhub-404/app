---
name: infrastructure
description: "Use only when implementing or placing persistence adapters, object storage, Redis, email, OAuth, or other external providers behind existing contracts."
---

# Infrastructure

Implement the ports owned by the application or public contract without moving
policy into the adapter. Keep database schemas, ORM models, provider clients,
serialization, retries, and configuration details inside infrastructure.

Map external representations explicitly at the boundary. Preserve transaction
and unit-of-work requirements, connection limits, error classification,
idempotency, and resource cleanup. Shared infrastructure may provide technical
capabilities but must not own product behavior.

Use the existing repository, storage, provider, and module boundaries. Verify
with focused adapter tests or the relevant integration contract. Query-shape
optimization is outside this scope; this skill concerns adapter placement and
external-system behavior.
