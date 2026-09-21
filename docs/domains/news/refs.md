# News — current references

## API

- `apps/api/src/modules/news/domain/news.ts`
- `apps/api/src/modules/news/domain/news-suggestion.ts`
- `apps/api/src/modules/news/application/news.policy.ts`
- `apps/api/src/modules/news/application/use-cases/command/`
- `apps/api/src/modules/news/application/use-cases/query/`
- `apps/api/src/modules/news/application/dtos/`
- `apps/api/src/modules/news/application/ports/repositories/`
- `apps/api/src/modules/news/infrastructure/`
- `apps/api/src/modules/news/public/`
- `apps/api/src/modules/news/presentation/news.controller.ts`

The versioned `/news` surface covers listing, RSS, popular sources,
suggestions, management, lookup by id/slug, drafts, publishing, archiving,
unarchiving, comments, and deletion.

## Web

- `apps/web/src/features/news/access/`
- `apps/web/src/features/news/actions/`
- `apps/web/src/features/news/api/`
- `apps/web/src/features/news/domain/`
- `apps/web/src/features/news/public/`
- `apps/web/src/features/news/ui/`
- `apps/web/src/features/news/ui/pages/`
- `apps/web/src/features/news/ui/schemas/`

## Tests

- `apps/api/tests/unit/domain/news.domain.spec.ts`
- `apps/api/tests/unit/use-cases/news.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
