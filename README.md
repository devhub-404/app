# DevHub 404

**A platform for discovery, participation, and building for developers.**

- Website: [devhub404.org](https://devhub404.org)
- Organization: [devhub-404](https://github.com/devhub-404)
- Community: [Discord](https://discord.gg/EUQ9MvucXD)

## The project

DevHub 404 starts with a simple idea: `404` is not the end; it is a signal
that something is missing. That gap may be an answer, reference, concept,
tool, project, opportunity, or clarity about the next step.

The product turns that gap into a flow of discovery, understanding,
resolution, building, and contribution:

```text
need something → discover → understand → solve → build → contribute
                                      ↖ community and knowledge ↙
```

The ecosystem brings together knowledge (Codex, Articles, Cheatsheets,
Roadmaps, Resources, News, and Q&A); building and opportunities (Projects,
Jobs, and Events); identity and participation (Accounts, Profiles,
authentication, Tags, Votes, Bookmarks, Comments, Feedback, Moderation, and
Notifications); and tools that turn knowledge into results.

Each owner has its own responsibility, rules, and lifecycle. Normative
specifications are in [`docs/domains`](./docs/domains/).

## Technical overview

This is a pnpm monorepo containing the Web application, API, OpenAPI contract,
and operational Workers:

```text
Browser
  │
  ▼
Web Worker
  ├── Service Binding → API Worker
  │                       └── Cloudflare Container
  │                             └── NestJS + Fastify
  │
  └── Service Binding → Assistant Worker

Purge Worker ── Service Binding → API Worker
Bot ─────────── Service Binding → Assistant Worker
```

During development, Web and API are local processes communicating over HTTP:

```text
Astro dev ── HTTP ── local NestJS
                         ├── local PostgreSQL
                         └── local Redis
```

The AI Worker, called `assistant`, has its own repository and serves both the
Web and the Discord bot. The `content` repository provides static content as
a submodule.

## Main stack

| Area | Technologies |
| --- | --- |
| Workspace | Node.js 22+, pnpm 10.15, TypeScript 7 |
| Web | Astro 7, SolidJS, `@astrojs/cloudflare` |
| UI | Ark UI, Tailwind CSS, Lucide/Iconify |
| Forms | Modular Forms and Zod |
| Editor | Tiptap, Markdown, and Lowlight |
| API | NestJS 11 and Fastify 5 |
| Persistence | Drizzle ORM and PostgreSQL 18 on Neon |
| Cache and limits | Upstash Redis and shared throttling |
| Authentication | OPAQUE, TOTP, Passkeys/WebAuthn, OAuth, and JWT |
| Files | S3 API, Cloudflare R2, and Sharp |
| Platform | Cloudflare Workers, Containers, R2, and Email |
| Contracts | OpenAPI, `openapi-fetch`, and `@devhub-404/api-contract` |
| Tests | Vitest and Supertest; Playwright reserved for future evolution |
| Quality | ESLint, Prettier, Astro Check, and TypeScript |
| Database and seeds | Drizzle Kit and deterministic static development fixtures |
| Local runtime | Docker Compose and Wrangler |

Exact versions and the separation between `dependencies` and
`devDependencies` are maintained in:

- [`apps/api/package.json`](./apps/api/package.json);
- [`apps/web/package.json`](./apps/web/package.json);
- [`packages/api-contract/package.json`](./packages/api-contract/package.json);
- [`workers/purge/package.json`](./workers/purge/package.json).

The project uses the native TypeScript 7 compiler and keeps
`@typescript/typescript6` for tools that still depend on the TypeScript 6 API.

## Architecture

### API

The API is a NestJS modular monolith divided into modules with explicit
boundaries:

```text
apps/api/src/
├── app/
├── modules/
│   └── <module>/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       ├── presentation/
│       └── public/
├── shared/
└── worker.ts
```

- `domain`: entities and business rules;
- `application`: use cases, DTOs, policies, and ports;
- `infrastructure`: PostgreSQL, Redis, S3/R2, and external providers;
- `presentation`: controllers, guards, pipes, and HTTP;
- `public`: contracts that may be consumed by other modules;
- `shared`: shared technical capabilities without product ownership;
- `app`: bootstrap and application composition;
- `worker.ts`: API Worker entry point.

A module does not access another module's internals. Cross-module dependencies
go through the provider module's `public` surface. `domain` contains business
rules and invariants; use cases contain functional rules, applied
authorization, and orchestration.

Input and output DTOs are classes with `class-validator`, `class-transformer`,
and Swagger decorators. OpenAPI is generated from the API controllers and
DTOs.

### Web

The Web uses Astro for SSR, pages, and composition, and SolidJS for
interactive islands:

```text
apps/web/src/
├── app/
├── pages/
├── features/
├── shared/
├── content.config.ts
└── worker.ts
```

Feature layers are optional:

```text
feature/
├── access/
├── actions/
├── api/
├── cache/
├── domain/
├── public/
├── schemas/
├── store/
├── types/
└── ui/
```

Web rules:

- `pages` are Astro route entry points;
- a page composes the layout, public query, and feature page;
- features do not import one another's internals;
- cross-feature composition occurs in `pages`;
- `public` exports only the feature's public surface;
- `access` controls route and operation presentation;
- the API remains the final authorization authority;
- `store` is reserved for application context state;
- page-only state uses local signals or `createStore`;
- every form has a Zod schema, including searches;
- `worker.ts` is the Web Worker entry point.

### Workers and bindings

In production, the Web Worker serves SSR and assets and has `API` and
`ASSISTANT` bindings; the API Worker forwards the backend to the Cloudflare
Container; the Container runs NestJS/Fastify and is not a source of persistent
state; the Purge Worker triggers maintenance through the API on a cron
schedule; and the bot uses the Assistant Worker. Bindings are one-way:
`Web → API` does not create `API → Web`.

During development, `API_URL` points to the local NestJS server. The `dev`
command uses hot reload and does not start infrastructure. The `start` command
starts local infrastructure, builds the Web and API (the API build runs in
Docker), waits for API readiness, and runs the Web/API Workers with
`wrangler dev --local`. The Web runs with `APP_ENV=production` to exercise its
API Service Binding; the API runs with `APP_ENV=development` to reach local
PostgreSQL, Redis, and MinIO from the Container. No separate transport flag is
used.

## OpenAPI and shared contract

```text
Controllers + DTOs + Swagger
              ↓
       OpenAPI generated by API
              ↓
packages/api-contract/openapi.json
              ↓
       Web with openapi-fetch
```

The `@devhub-404/api-contract` package contains the transport artifact
generated by the API. It contains no domain rules and does not use Zod.

After changing controllers or DTOs:

```bash
pnpm openapi
```

The generated file must not be edited manually.

## Static content

The `content` submodule is a separate repository and the source of truth for
`cheatsheets` in Markdown, `codex` in JSON manifests, and `roadmaps` in JSON
manifests and Markdown topics. The Web loads these collections from
[`apps/web/src/content.config.ts`](./apps/web/src/content.config.ts). Static
content must not be duplicated in `apps/web/src`.

`tools` does not belong to the submodule: it is an executable application
capability implemented in the `tool` feature.

## Infrastructure

### Production

- Cloudflare Workers for Web, API, and purge;
- Cloudflare Containers for running the NestJS API;
- Neon with PostgreSQL 18 as persistent storage;
- Upstash Redis for cache, auxiliary session state, and shared throttling;
- Cloudflare R2 as S3-compatible object storage;
- Cloudflare Email/provider configured for transactional email;
- Assistant Worker in its own repository;
- `content` submodule for static content.

The Container is ephemeral. Sessions, uploads, migrations, and domain data do
not depend on the Container's local disk.

### Development

Local Docker Compose provides PostgreSQL for `devhub_404_dev`, local Redis, and
separate persistent volumes for the local environment.

| Service | Address |
| --- | --- |
| PostgreSQL | `localhost:5434` |
| Redis | `redis://localhost:6381` |
| Local API | `http://localhost:8080` |
| Local Web | `http://localhost:4321` |

## Environments and configuration

- `.env.development.example`: local configuration contract;
- `.env.development`: local configuration, not committed;
- `.env.test`: isolated test configuration;
- production: variables and secrets configured in Cloudflare environments.

Seeds and reset are protected for `APP_ENV=development` and the local
development database. Production secrets must not be placed in Git, committed
`.env` files, or `wrangler.jsonc`.

## Local development

Prerequisites: Node.js `>=22.12`, pnpm `11.21.0`, Docker, and Docker Compose.

```bash
pnpm install --frozen-lockfile
cp .env.development.example .env.development
pnpm dev:setup
pnpm dev
```

`dev:setup` starts the infrastructure, applies migrations, resets the
development database, and loads the deterministic local fixtures. The `dev`
script does not recreate or modify the database automatically.

Useful commands:

```bash
pnpm infra:dev:up
pnpm infra:dev:down
pnpm infra:dev:logs
pnpm db:migrate:dev
pnpm db:reset:dev
pnpm db:seed:dev
pnpm db:seed:dev:reset
pnpm start
pnpm start:purge
```

`pnpm dev` starts Web and API with watchers. Prepare it once with
`pnpm dev:setup`. `pnpm start` validates the Worker/Container runtime locally;
its first startup is slower because it builds the API image. Purge is started
separately.

## Tests and validation

API tests include unit tests for entities, domain rules, services, policies,
and use cases. Integration tests are restricted to authentication, including
persistence and critical ceremonies.

Web tests include unit tests for `access`, routes, roles, capabilities, and
every form schema, including search schemas. There are no general Web E2E or
integration tests at this stage.

```bash
pnpm test:unit
pnpm test:unit:watch
pnpm test:integration:auth
pnpm check
pnpm typecheck
pnpm build
```

Watch mode is only a local convenience, not a test category.

## Build and deployment

Recommended validation before deployment:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm typecheck
pnpm test:unit
pnpm build
pnpm openapi
```

Worker dry runs:

```bash
pnpm --filter @devhub-404/api exec wrangler deploy --dry-run
pnpm --filter @devhub-404/web exec wrangler deploy --dry-run
pnpm --filter @devhub-404/worker-purge exec wrangler deploy --dry-run
```

Individual deployment uses `pnpm deploy:api`, `pnpm deploy:web`, and
`pnpm deploy:purge`; full deployment uses `pnpm deploy:all`. The standard order
is API, Web, and Purge. The Assistant Worker is published from its own
repository.

## Repository structure

```text
app/
├── apps/
│   ├── api/
│   │   ├── src/             NestJS application and API Worker
│   │   ├── scripts/         development and database scripts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── wrangler.jsonc
│   │
│   └── web/
│       ├── src/             Astro/SolidJS application and Web Worker
│       ├── tests/
│       ├── package.json
│       └── wrangler.jsonc
│
├── packages/
│   └── api-contract/        OpenAPI generated by the API
├── workers/
│   └── purge/               scheduled maintenance Worker
├── content/                 static-content submodule
├── docs/                    architecture, owners, decisions, operations
├── AGENTS.md                agent instructions
├── skills/                  project skills
├── docker-compose.dev.yml
├── docker-compose.test.yml
├── .env.development.example
├── .env.test
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Contribution and governance

Contributions are accepted through issues and pull requests, but domain
control is mandatory.

### Changes allowed directly

The following may be proposed directly when they preserve existing RN/RF:

- `fix`: bug fix aligned with normative behavior;
- `refactor`: structural change without behavioral change;
- `test`: adding or correcting evidence;
- `docs`: documentation;
- `chore`: maintenance, dependencies, and tooling;
- `build`, `ci`, `perf`, and `style`, provided they do not change the product
  contract.

### Changes requiring a prior proposal

RN and RF directly define the domain and product. They are not approved as
simple implementation changes when they create, remove, or change business
rules or functional capabilities; change domain ownership, entity states,
transitions, authorization, or product security; change a functional contract;
or become incompatible with `spec.md`.

These changes must follow this flow:

```text
proposal issue/PR
        ↓
context, problem, and alternatives
        ↓
discussion and decision
        ↓
update spec/ADR/plan
        ↓
implementation in a separate or explicitly linked PR
        ↓
tests, contract, and documentation
```

An implementation must not silently introduce a product change through a code
PR. The implementation PR must reference the approved proposal and show the
consequences for domain, API, Web, persistence, authorization, tests, and
documentation.

### Pull request checklist

- the change preserves or references the corresponding RN/RF;
- module and feature boundaries are respected;
- DTOs, Swagger, and OpenAPI are updated when necessary;
- relevant tests are added or adjusted;
- `pnpm check`, `pnpm typecheck`, and applicable tests pass;
- documentation and ADRs are updated when a decision changes;
- no secret or private data is included.

Commits use:

```text
type(scope): short description
```

Examples:

```text
fix(auth): reject expired recovery token
refactor(article): isolate query projection
test(web): cover article search schema
docs: explain local worker runtime
```

## Reference documentation

- [`docs/README.md`](./docs/README.md): documentation index;
- [`docs/architecture/`](./docs/architecture/): architecture and runtime;
- [`docs/domains/`](./docs/domains/): rules and owner references;
- [`docs/decisions/`](./docs/decisions/): current architectural decisions;
- [`docs/development.md`](./docs/development.md): local development;
- [`docs/validation.md`](./docs/validation.md): monorepo validation;
- [`docs/web/README.md`](./docs/web/README.md): Web features without an API
  owner;
- [`packages/api-contract/openapi.json`](./packages/api-contract/openapi.json):
  generated HTTP contract.
