# View — current references

## API

- `apps/api/src/modules/view/domain/view.ts`
- `apps/api/src/modules/view/domain/view-target.policy.ts`
- `apps/api/src/modules/view/application/use-cases/command/record-view.command.ts`
- `apps/api/src/modules/view/application/view-statistics.projection.ts`
- `apps/api/src/modules/view/application/views/`
- `apps/api/src/modules/view/infrastructure/`
- `apps/api/src/modules/view/public/`
- `apps/api/src/modules/view/presentation/view.controller.ts`

The versioned surface records access at `/views/:resourceId`; statistics are
exposed through the public contract consumed by owners.

## Web

There is no independent `view` Web feature; content owners compose metrics in
their own features.

## Tests

- `apps/api/tests/unit/domain/view.domain.spec.ts`
- `apps/api/tests/unit/use-cases/view.use-cases.spec.ts`
