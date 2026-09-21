# Event — current references

## API

- `apps/api/src/modules/event/domain/event.ts`
- `apps/api/src/modules/event/domain/event-suggestion.ts`
- `apps/api/src/modules/event/application/use-cases/command/`
- `apps/api/src/modules/event/application/use-cases/query/`
- `apps/api/src/modules/event/application/dtos/`
- `apps/api/src/modules/event/application/ports/repositories/`
- `apps/api/src/modules/event/infrastructure/`
- `apps/api/src/modules/event/public/`
- `apps/api/src/modules/event/presentation/`

The versioned `/events` surface covers public listing and reading,
administrative lookup, creation, suggestions, review, updating, status, and
deletion.

## Web

- `apps/web/src/features/event/access/`
- `apps/web/src/features/event/actions/`
- `apps/web/src/features/event/api/`
- `apps/web/src/features/event/public/`
- `apps/web/src/features/event/ui/`
- `apps/web/src/features/event/ui/pages/`
- `apps/web/src/features/event/ui/schemas/`

## Tests

- `apps/api/tests/unit/domain/event.domain.spec.ts`
- `apps/api/tests/unit/use-cases/event.use-cases.spec.ts`
- `apps/web/tests/unit/access/access-predicates.test.ts`
- `apps/web/tests/unit/access/access-boundaries.test.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
