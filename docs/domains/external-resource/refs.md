# External resource — current references

## API

Domain and policy:

- `apps/api/src/modules/external-resource/domain/external-resource.ts`
- `apps/api/src/modules/external-resource/domain/external-resource-suggestion.ts`
- `apps/api/src/modules/external-resource/application/resource.policy.ts`
- `apps/api/src/modules/external-resource/public/`

Use cases and contracts:

- `apps/api/src/modules/external-resource/application/use-cases/command/`
- `apps/api/src/modules/external-resource/application/use-cases/query/`
- `apps/api/src/modules/external-resource/application/dtos/in/`
- `apps/api/src/modules/external-resource/application/dtos/out/`
- `apps/api/src/modules/external-resource/application/ports/repositories/`

Persistence and HTTP:

- `apps/api/src/modules/external-resource/infrastructure/`
- `apps/api/src/modules/external-resource/presentation/resources.controller.ts`

The versioned `/resources` controller exposes public listing and reading,
administrative queries, creation/editing/archiving/restoration/deletion,
suggestion creation and lookup, and suggestion acceptance or rejection.

## Web

The API owner is exposed as the `resource` interface feature:

- `apps/web/src/features/resource/access/`
- `apps/web/src/features/resource/actions/`
- `apps/web/src/features/resource/api/`
- `apps/web/src/features/resource/domain/`
- `apps/web/src/features/resource/public/`
- `apps/web/src/features/resource/ui/`

Entry points and schemas:

- `apps/web/src/features/resource/ui/pages/`
- `apps/web/src/features/resource/ui/schemas/`

## Tests

- `apps/api/tests/unit/domain/resource.domain.spec.ts`
- `apps/api/tests/unit/use-cases/resource.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
