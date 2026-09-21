# Local development

## First run

Copy the development environment file and adjust local values when necessary:

```bash
cp .env.development.example .env.development
pnpm dev:setup
```

`dev:setup` runs, in this order:

1. starts PostgreSQL, Redis, and the local S3-compatible object store;
2. applies migrations to `devhub_404_dev`;
3. resets the development database;
4. loads deterministic static fixtures for the local application surfaces.

Then start the application:

```bash
pnpm dev
```

`pnpm dev` runs Astro/Vite and NestJS directly with hot reload. It does not
start infrastructure, run migrations, or seed data automatically.

For the Worker/Container validation path, use:

```bash
pnpm start
```

`pnpm start` starts local infrastructure, applies pending migrations, builds
the Web, builds the API inside its Docker image, waits for API readiness, and
then starts both local Wrangler sessions. It does not seed or reset the
database. The first run is slower because Wrangler prepares the Container
image. Stop it with `Ctrl+C`; infrastructure remains running and can be
stopped explicitly with `pnpm infra:dev:down`.

The two application environments are sufficient to select the runtime path:

| Command | Web `APP_ENV` | API `APP_ENV` | API path |
| --- | --- | --- | --- |
| `pnpm dev` | `development` | `development` | direct HTTP to NestJS |
| `pnpm start` | `production` | `development` | Web Service Binding to API Worker and local resources inside Container |

There is no separate transport flag. The Web uses its `API` Service Binding
when it runs with `APP_ENV=production`; direct Astro development uses
`API_URL`. The API remains `development` in `start` because its Container must
reach PostgreSQL, Redis, and MinIO running on the local host.

## Commands

```bash
pnpm infra:dev:up          # inicia os serviços
pnpm infra:dev:down        # stops services, preserving volumes
pnpm infra:dev:logs        # acompanha os logs
pnpm db:migrate:dev        # aplica migrations pendentes
pnpm db:seed:dev           # resets and loads the deterministic fixtures
pnpm db:seed:dev:reset     # explicit alias for the full seed
pnpm db:reset:dev          # clears the development database only
pnpm start                 # builds and runs the local Worker/Container path
pnpm start:purge           # inicia separadamente o Worker de purge
```

Reset and seed are allowed only with `APP_ENV=development` and only for a URL
that points to `devhub_404_dev`. The static datasets live under
`apps/api/scripts/seed/data`; the script loads them in dependency order and
validates the local database through its foreign keys.

## Local services

| Serviço | Endereço |
| --- | --- |
| PostgreSQL | `localhost:5434` |
| Redis | `redis://localhost:6381` |
| Object storage API | `http://localhost:9010` |
| Object storage console | `http://localhost:9011` |

The database uses the Docker volume `devhub-404-dev-db`, and Redis uses
`devhub-404-dev-redis`. Object storage uses `devhub-404-dev-object-store`.
`infra:dev:down` does not remove these volumes.

To remove persisted data, removal must be explicit:

```bash
docker compose -f docker-compose.dev.yml down -v
```
