---
kind: architecture
status: current
scope: runtime
---

# Runtime and Workers

## Produção

```text
Browser
  ↓
Web Worker
  ├── Service Binding → API Worker → Cloudflare Container → NestJS/Fastify
  └── Service Binding → Assistant Worker

Purge Worker ── Service Binding → API Worker
Bot ─────────── Service Binding → Assistant Worker
```

The Web Worker serves SSR and assets. The API Worker is the backend entry point
and manages the API Container. The purge Worker only schedules maintenance
and must use the API as its contract; it does not replicate domain rules. Its
current handler is a stub: the binding is declared, but purge jobs have not
yet been implemented.

The Assistant Worker has its own repository and serves the Web and bot.

## Development

```text
pnpm dev
  Astro/Vite ── HTTP ── NestJS local

pnpm start
  Web Worker ── Service Binding ── API Worker ── Container ── local infra
```

`pnpm dev` sets both applications to `APP_ENV=development`, starts no
infrastructure, and runs the Web and API directly with hot reload. It expects
the preparation performed by `pnpm dev:setup`.

`pnpm start` builds the Web with `APP_ENV=production`, so its Worker uses the
`API` Service Binding, and runs the API Worker/Container with
`APP_ENV=development`, so the Container can use the local PostgreSQL, Redis,
and MinIO endpoints. The distinction is the application environment; there is
no separate transport mode. A binding in one direction does not automatically
create a reverse binding.

The start orchestrator waits for `/api/v1/platform/readiness` before starting
the Web Worker. Readiness checks the database, rate-limit Redis, and local
object storage; the response is intentionally wrapped by the normal API
response envelope.

The purge Worker is started separately with `pnpm start:purge` because its
execution is scheduled and is not part of the normal interactive flow.

## Production entry points

- `apps/web/src/worker.ts`: Web Worker;
- `apps/api/src/worker.ts`: API Worker;
- `workers/purge/src/index.ts`: Worker de manutenção.

These files belong to the production runtime. Watchers, seeds, reset, Docker
Compose, and development configuration remain outside `src`.
