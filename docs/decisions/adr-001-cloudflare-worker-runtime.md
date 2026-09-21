---
kind: adr
status: current
---

# ADR-001: Cloudflare runtime for Web, API, and maintenance

## Context

The system must execute Astro SSR and assets, expose the NestJS/Fastify API,
connect to the Assistant Worker, and run scheduled maintenance without
depending on resident processes or local memory as a source of state.

Local development must remain simple and observable, without requiring
production Service Bindings on the developer's machine.

## Alternatives considered

- run Web and API as independent HTTP processes in every environment;
- put the entire API directly in a Worker without a Container;
- use Service Bindings only in production and local HTTP in development;
- make each Worker replicate domain rules and database access.

## Decision

We use separate Cloudflare Workers by responsibility:

```text
Production
Browser
  └─ Web Worker
       ├─ Service Binding API → API Worker → Cloudflare Container
       │                                  └─ NestJS + Fastify
       └─ Service Binding ASSISTANT → Assistant Worker

Purge Worker ── Service Binding API → API Worker
Bot ─────────── Service Binding ASSISTANT → Assistant Worker
```

- The Web Worker executes Astro SSR and serves assets. In production, API
  calls use the `API` binding and AI calls use `ASSISTANT`.
- The API Worker is the backend entry point and forwards NestJS/Fastify
  execution to the `DevHubApiContainer` defined in
  `apps/api/wrangler.jsonc`.
- The Container is ephemeral. PostgreSQL, Redis, object storage, sessions,
  migrations, and domain state do not depend on the Container's disk or local
  memory.
- The Purge Worker only schedules and triggers API operations. Domain rules and
  idempotency belong to API owners.
- The Assistant Worker remains in its own repository and serves Web and bot.
- In development, Web and API are local processes communicating over HTTP. Web
  uses `API_URL=http://localhost:8080`; production bindings are not simulated
  automatically.
- The Purge Worker starts separately because its trigger is scheduled and is
  not part of the normal interactive flow.

## Consequences

- Bindings are one-way: `Web → API` does not create `API → Web`.
- Worker code remains in runtime entry points (`src/worker.ts` in the apps and
  `workers/purge/src/index.ts`); development configuration, seeds, and
  watchers remain outside `src`.
- The API must use shared storage for data that must survive multiple
  instances, including Redis for throttling and cache where applicable.
- Production must protect secrets, prevent direct origin bypass, and respect
  the PostgreSQL connection budget.
- Purge remains incomplete until its handler implements effective jobs; the
  current binding alone is not a maintenance routine.

## Condition for review

Review this decision if the API no longer requires a Container, if the
Assistant Worker moves into this repository, or if local development starts
reproducing real Service Bindings instead of HTTP.
