# Notification — current references

## API

Domain, policy, and composition:

- `apps/api/src/modules/notification/domain/notification.ts`
- `apps/api/src/modules/notification/application/policies/notification-policy.registry.ts`
- `apps/api/src/modules/notification/public/`

Use cases and contracts:

- `apps/api/src/modules/notification/application/use-cases/command/`
- `apps/api/src/modules/notification/application/use-cases/query/`
- `apps/api/src/modules/notification/application/dtos/`
- `apps/api/src/modules/notification/application/shared/notification-cursor.ts`

Persistence and presentation:

- `apps/api/src/modules/notification/infrastructure/`
- `apps/api/src/modules/notification/presentation/notification.controller.ts`

The versioned `/me/notifications` controller exposes synchronization,
individual read marking, and marking all as read. The module also listens for
account-purge events and has a use case for cleaning old notices.

## Web

There is currently no independent `notification` Web feature in the feature
list. The interface surface should be added to the composition owner that uses
it while keeping the API contract as its dependency.

## Tests

- `apps/api/tests/unit/domain/notification.domain.spec.ts`
- `apps/api/tests/unit/policies/notification-policy.registry.spec.ts`
- `apps/api/tests/unit/use-cases/notification.use-cases.spec.ts`

There are currently no specific integration or UI tests for `notification`.
