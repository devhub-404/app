# Job — current references

## API

- `apps/api/src/modules/job/domain/job.ts`
- `apps/api/src/modules/job/domain/job-suggestion.ts`
- `apps/api/src/modules/job/application/policies/job-access.service.ts`
- `apps/api/src/modules/job/application/use-cases/command/`
- `apps/api/src/modules/job/application/use-cases/query/`
- `apps/api/src/modules/job/application/dtos/`
- `apps/api/src/modules/job/application/ports/repositories/`
- `apps/api/src/modules/job/infrastructure/`
- `apps/api/src/modules/job/public/`
- `apps/api/src/modules/job/presentation/job.controller.ts`

The versioned `/jobs` surface covers listing, lookup, management, own jobs,
creation, updating, closing, withdrawal, renewal, deletion, and suggestions.

## Web

- `apps/web/src/features/job/access/`
- `apps/web/src/features/job/actions/`
- `apps/web/src/features/job/api/`
- `apps/web/src/features/job/public/`
- `apps/web/src/features/job/ui/`
- `apps/web/src/features/job/ui/pages/`
- `apps/web/src/features/job/ui/schemas/`

## Tests

- `apps/api/tests/unit/domain/job.domain.spec.ts`
- `apps/api/tests/unit/policies/job-access.service.spec.ts`
- `apps/api/tests/unit/use-cases/job.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
