# Article — current references

This file records the current implementation of `article`.

## API

Module, domain, and policy:

- `apps/api/src/modules/article/article.module.ts`
- `apps/api/src/modules/article/domain/article.ts`
- `apps/api/src/modules/article/application/article.policy.ts`
- `apps/api/src/modules/article/public/`

Use cases and contracts:

- `apps/api/src/modules/article/application/use-cases/command/`
- `apps/api/src/modules/article/application/use-cases/query/`
- `apps/api/src/modules/article/application/dtos/in/`
- `apps/api/src/modules/article/application/dtos/out/`
- `apps/api/src/modules/article/application/ports/repositories/`

Persistence and HTTP:

- `apps/api/src/modules/article/infrastructure/`
- `apps/api/src/modules/article/presentation/article/articles.controller.ts`

The versioned `/articles` controller exposes public listing, popular tags,
RSS, own articles, moderation lookup, lookup by id and slug, content by id
and slug, draft creation, publishing, archiving, unarchiving, updating,
comment configuration, and deletion.

## Web

- `apps/web/src/features/article/access/`
- `apps/web/src/features/article/actions/`
- `apps/web/src/features/article/api/`
- `apps/web/src/features/article/cache/`
- `apps/web/src/features/article/domain/`
- `apps/web/src/features/article/public/`
- `apps/web/src/features/article/ui/`

UI entry points:

- `apps/web/src/features/article/ui/pages/articles.page.astro`
- `apps/web/src/features/article/ui/pages/article.page.astro`
- `apps/web/src/features/article/ui/pages/article-new.page.astro`
- `apps/web/src/features/article/ui/pages/article-edit.page.astro`

Form and search schemas:

- `apps/web/src/features/article/ui/schemas/forms.schema.ts`
- `apps/web/src/features/article/ui/schemas/search.schema.ts`

## Tests

API unit tests:

- `apps/api/tests/unit/domain/article.domain.spec.ts`
- `apps/api/tests/unit/use-cases/article.use-cases.spec.ts`

Shared Web unit tests covering the feature:

- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`

There is currently no specific `article.integration.spec.ts` or
`article.ui.spec.ts`; older documents claiming their existence are not
evidence of the current setup.
