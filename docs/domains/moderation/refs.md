# Moderation — current references

## API

Domain and public contracts:

- `apps/api/src/modules/moderation/domain/account-restriction.ts`
- `apps/api/src/modules/moderation/public/`
- `apps/api/src/modules/moderation/application/ports/`

Use cases and contracts:

- `apps/api/src/modules/moderation/application/use-cases/command/`
- `apps/api/src/modules/moderation/application/use-cases/query/`
- `apps/api/src/modules/moderation/application/dtos/`
- `apps/api/src/modules/moderation/application/account-restriction.service.ts`

Persistence and HTTP:

- `apps/api/src/modules/moderation/infrastructure/`
- `apps/api/src/modules/moderation/presentation/account-restrictions.controller.ts`
- `apps/api/src/modules/moderation/presentation/moderation-reports.controller.ts`

The versioned surfaces are `/moderation/accounts` for standing and
restrictions and `/moderation` for hiding/showing resources and comments and
listing hidden targets.

## Web

- `apps/web/src/features/moderation/`

Interface composition queries owner capabilities and does not replicate
moderation infrastructure inside each feature.

## Tests

- `apps/api/tests/unit/domain/moderation.domain.spec.ts`
- `apps/api/tests/unit/use-cases/moderation.use-cases.spec.ts`
- `apps/api/tests/unit/use-cases/support/moderation/account-restriction.cases.ts`

There are currently no specific integration or UI tests for `moderation`.
