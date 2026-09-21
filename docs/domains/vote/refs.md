# Vote — current references

## API

- `apps/api/src/modules/vote/domain/vote.ts`
- `apps/api/src/modules/vote/domain/vote-target.policy.ts`
- `apps/api/src/modules/vote/application/use-cases/command/`
- `apps/api/src/modules/vote/application/use-cases/query/`
- `apps/api/src/modules/vote/application/votes/`
- `apps/api/src/modules/vote/application/ports/repositories/`
- `apps/api/src/modules/vote/infrastructure/`
- `apps/api/src/modules/vote/public/`
- `apps/api/src/modules/vote/presentation/vote.controller.ts`

The versioned surface covers setting/removing at `/votes/:resourceId`,
synchronization at `/me/votes`, and statistics through the public contract.

## Web

There is no independent `vote` Web feature; content features use the public
interaction contract in their own surfaces.

## Tests

- `apps/api/tests/unit/domain/vote.domain.spec.ts`
- `apps/api/tests/unit/use-cases/vote.use-cases.spec.ts`
