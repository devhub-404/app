# Q&A — current references

## API

- `apps/api/src/modules/q-and-a/domain/question.ts`
- `apps/api/src/modules/q-and-a/domain/answer.ts`
- `apps/api/src/modules/q-and-a/application/use-cases/command/`
- `apps/api/src/modules/q-and-a/application/use-cases/query/`
- `apps/api/src/modules/q-and-a/application/dtos/`
- `apps/api/src/modules/q-and-a/application/ports/repositories/`
- `apps/api/src/modules/q-and-a/infrastructure/`
- `apps/api/src/modules/q-and-a/public/`
- `apps/api/src/modules/q-and-a/presentation/q-and-a.controller.ts`
- `apps/api/src/modules/q-and-a/presentation/answers.controller.ts`

The versioned `/questions` surface covers listing, lookup, creation, answers,
accepting/removing an accepted answer, closing, reopening, and deletion.
`/answers/mine` lists own answers.

## Web

- `apps/web/src/features/q-and-a/access/`
- `apps/web/src/features/q-and-a/actions/`
- `apps/web/src/features/q-and-a/api/`
- `apps/web/src/features/q-and-a/domain/`
- `apps/web/src/features/q-and-a/public/`
- `apps/web/src/features/q-and-a/ui/`
- `apps/web/src/features/q-and-a/ui/pages/`
- `apps/web/src/features/q-and-a/ui/schemas/`

## Tests

- `apps/api/tests/unit/domain/q-and-a.domain.spec.ts`
- `apps/api/tests/unit/use-cases/q-and-a.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
