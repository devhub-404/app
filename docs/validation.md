# Monorepo validation

The main validation commands run from the `app` root:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:unit
pnpm test:integration:auth
pnpm build
pnpm openapi
```

Typecheck covers the API, Web, OpenAPI contract, and Workers included in the
workspace. Unit tests cover the API and Web.

Worker dry runs require Docker for the API Container and run separately:

```bash
pnpm --filter @devhub-404/web exec wrangler deploy --dry-run
pnpm --filter @devhub-404/api exec wrangler deploy --dry-run
pnpm --filter @devhub-404/worker-purge exec wrangler deploy --dry-run
```

The Web may emit warnings when the external content repository is not yet
available. These warnings belong to content integration and are not typecheck
or build failures.
