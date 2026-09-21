# Project — current references

## API

- `apps/api/src/modules/project/domain/project.ts`
- `apps/api/src/modules/project/application/policies/project-access.service.ts`
- `apps/api/src/modules/project/application/use-cases/command/`
- `apps/api/src/modules/project/application/use-cases/query/`
- `apps/api/src/modules/project/application/dtos/`
- `apps/api/src/modules/project/application/ports/repositories/`
- `apps/api/src/modules/project/infrastructure/`
- `apps/api/src/modules/project/public/`
- `apps/api/src/modules/project/presentation/project.controller.ts`

The versioned `/projects` surface covers public listing, lookup by slug,
management lookup by id, own projects, creation, updating, publishing,
archiving, unarchiving, and deletion.

## Web

- `apps/web/src/features/project/access/`
- `apps/web/src/features/project/actions/`
- `apps/web/src/features/project/api/`
- `apps/web/src/features/project/domain/`
- `apps/web/src/features/project/public/`
- `apps/web/src/features/project/ui/`
- `apps/web/src/features/project/ui/pages/`
- `apps/web/src/features/project/ui/schemas/`

## Tests

- `apps/api/tests/unit/domain/project.domain.spec.ts`
- `apps/api/tests/unit/policies/project-access.service.spec.ts`
- `apps/api/tests/unit/use-cases/project.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
