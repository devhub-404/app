# Architectural decisions

New decisions are recorded here in `adr-<number>-<slug>.md` files.

A decision should record only:

- context and problem;
- relevant alternatives;
- adopted decision;
- consequences;
- review condition.

It must not duplicate domain specifications, file inventories, or operational
documentation.

Current decisions must be consulted in this folder; when an older decision is
replaced, the current ADR must explicitly record the change.

## Current decisions

- [`adr-001-cloudflare-worker-runtime.md`](./adr-001-cloudflare-worker-runtime.md)
  — Workers, Container, bindings e comunicação local;
- [`adr-002-testing-strategy.md`](./adr-002-testing-strategy.md) — incremental
  scope for unit tests and critical authentication integration.
- [`adr-003-language-policy.md`](./adr-003-language-policy.md) — canonical
  language for documentation and static editorial content.
