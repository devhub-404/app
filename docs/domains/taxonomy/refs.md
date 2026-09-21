# Taxonomy — current references

## API

Domain, public contracts, and content validation:

- `apps/api/src/modules/taxonomy/domain/tag.ts`
- `apps/api/src/modules/taxonomy/public/`
- `apps/api/src/modules/taxonomy/application/integration/taxonomy-manifest.validator.ts`

Use cases and contracts:

- `apps/api/src/modules/taxonomy/application/tag/use-cases/command/`
- `apps/api/src/modules/taxonomy/application/tag/use-cases/query/`
- `apps/api/src/modules/taxonomy/application/tag/dtos/`
- `apps/api/src/modules/taxonomy/application/tag/ports/`

Persistence and HTTP:

- `apps/api/src/modules/taxonomy/infrastructure/repositories/`
- `apps/api/src/modules/taxonomy/presentation/tags.controller.ts`

The versioned `/taxonomy/tags` surface covers search, resolution, aliases,
identity terms, tag workflow, and merging.

## Web

Interface features that use classification expose their own public contracts;
there is no independent `taxonomy` Web feature registered in the current list.

## Tests

- `apps/api/tests/unit/use-cases/taxonomy.use-cases.spec.ts`

There is currently no domain unit, integration, or UI test specific to
`taxonomy` registered in the current setup.
