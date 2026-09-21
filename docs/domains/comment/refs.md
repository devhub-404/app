# Comment — current references

## API

Target domain and policy:

- `apps/api/src/modules/comment/domain/comment.ts`
- `apps/api/src/modules/comment/domain/comment-target.policy.ts`
- `apps/api/src/modules/comment/application/comments/comments.policy.ts`
- `apps/api/src/modules/comment/application/comments/comment-target-access.service.ts`

Use cases and projections:

- `apps/api/src/modules/comment/application/use-cases/command/`
- `apps/api/src/modules/comment/application/use-cases/query/`
- `apps/api/src/modules/comment/application/comments/comment-statistics.projection.ts`
- `apps/api/src/modules/comment/application/comments/dtos/`
- `apps/api/src/modules/comment/application/comments/ports/`

Persistence, contracts, and HTTP:

- `apps/api/src/modules/comment/infrastructure/`
- `apps/api/src/modules/comment/public/`
- `apps/api/src/modules/comment/presentation/domain-comments.controller.ts`
- `apps/api/src/modules/comment/presentation/comments.controller.ts`

The versioned surfaces include threads at `articles/:articleId/comments` and
`news/:newsId/comments`, plus own-comment management, updating, and deletion
at `/comments`.

## Web

- `apps/web/src/features/comment/access/`
- `apps/web/src/features/comment/actions/`
- `apps/web/src/features/comment/api/`
- `apps/web/src/features/comment/public/`
- `apps/web/src/features/comment/ui/`
- `apps/web/src/features/comment/ui/schemas/forms.schema.ts`

## Tests

- `apps/api/tests/unit/domain/comment.domain.spec.ts`
- `apps/api/tests/unit/use-cases/comment.use-cases.spec.ts`
- `apps/api/tests/unit/use-cases/support/comment/queries.cases.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
