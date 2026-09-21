---
kind: architecture
status: current
scope: repository
---

# Architecture overview

The `app` repository is a monorepo containing the main application, shared
contracts, and operational Workers. The `devhub-404` GitHub organization may
have other repositories, such as `bot` and `content`; they are not required
to be subdirectories of this repository.

```text
app/
├── apps/
│   ├── api/                 NestJS + Fastify + API Worker
│   └── web/                 Astro + SolidJS + Web Worker
├── packages/
│   └── api-contract/        OpenAPI gerado pela API
├── workers/
│   └── purge/               Worker agendado de manutenção
├── docs/
├── docker-compose.dev.yml
├── docker-compose.test.yml
├── .env.development
└── package.json
```

## Boundaries

- `apps/api` owns HTTP behavior, authentication, domain, persistence, and
  backend integrations.
- `apps/web` owns page composition, context state, interaction, and browser
  presentation.
- `packages/api-contract` is a shared transport artifact, not a domain module.
- `workers/purge` schedules maintenance and calls the API through a Worker
  contract.
- the Assistant Worker remains in its own repository.
- the external `content` repository provides static content consumed by the
  Web.

## Dependencies

```text
Web pages → own feature public surface → Web shared
API module A → module B public surface → API shared
API app → public modules + technical composition
packages/api-contract → gerado pela API e consumido pelo Web
```

Web features do not depend on one another. When a page needs to compose more
than one feature, composition occurs in `src/pages`.

`shared` contains technical capabilities without product ownership. `public`
is an owner's explicit boundary and must not export its internal details.

## Environments

- `development`: local applications, HTTP between Web and API, and local
  Docker infrastructure;
- `test`: dedicated database and Redis for test suites;
- `production`: bindings between Workers and Cloudflare services.

Behavior that changes between environments remains in runtime code only when
the selection is part of executed behavior, such as choosing local HTTP or a
Service Binding. Seeds, reset, watchers, and orchestration remain outside
`src`.
