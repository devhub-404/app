# DevHub 404 documentation

This is the current documentation for the `app` repository.

## Reading order

1. [`architecture/overview.md`](./architecture/overview.md) — repository
   boundaries and overall flow;
2. [`architecture/api.md`](./architecture/api.md) — NestJS modular monolith;
3. [`architecture/web.md`](./architecture/web.md) — Astro/SolidJS composition;
4. [`architecture/content.md`](./architecture/content.md) — static content
   and Astro collections;
5. [`architecture/runtime.md`](./architecture/runtime.md) — Workers,
   bindings, and environments;
6. [`domains/README.md`](./domains/README.md) — current owners and domain
   documentation boundaries;
7. [`web/README.md`](./web/README.md) — Web features without an API owner;
8. [`development.md`](./development.md) and [`validation.md`](./validation.md)
   — local execution and validation.

## Sources of truth

- normative behavior: `docs/domains/<owner>/spec.md`;
- implementation evidence: `docs/domains/<owner>/refs.md`;
- HTTP contract: `packages/api-contract/openapi.json`;
- architecture and runtime: `docs/architecture/`;
- irreversible or high-impact decisions: `docs/decisions/`;
- effective implementation: `apps/`, `packages/`, and `workers/`.

`spec.md` must not contain file paths. `refs.md` must not contain business
rules or decisions. Both are created only for owners reviewed against the
current code.

## Documentation principles

- document stable decisions, not every implementation detail;
- prefer links to code and contracts over copied inventories;
- do not claim tests that do not exist;
- do not force a correspondence between API modules and Web features;
- update documentation in the same change that alters a normative rule;
- keep documents short enough to review alongside the code.
