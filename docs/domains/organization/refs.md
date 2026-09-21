# Organization — current references

## API

- `apps/api/src/modules/organization/domain/organization.ts`
- `apps/api/src/modules/organization/application/use-cases/command/`
- `apps/api/src/modules/organization/application/use-cases/query/`
- `apps/api/src/modules/organization/application/dtos/`
- `apps/api/src/modules/organization/application/ports/`
- `apps/api/src/modules/organization/infrastructure/`
- `apps/api/src/modules/organization/public/`
- `apps/api/src/modules/organization/presentation/organization.controller.ts`

The versioned `/organizations` surface covers the public directory, creation,
own organizations, lookup by slug, updating, archiving, unarchiving, deletion,
and member management.

## Web

- `apps/web/src/features/organization/access/`
- `apps/web/src/features/organization/actions/`
- `apps/web/src/features/organization/api/`
- `apps/web/src/features/organization/domain/`
- `apps/web/src/features/organization/public/`
- `apps/web/src/features/organization/ui/`
- `apps/web/src/features/organization/ui/pages/`
- `apps/web/src/features/organization/ui/schemas/forms.schema.ts`

## Tests

- `apps/api/tests/unit/domain/organization.domain.spec.ts`
- `apps/api/tests/unit/use-cases/organization.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
