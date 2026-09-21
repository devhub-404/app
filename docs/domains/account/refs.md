# Account — current references

This file records where `account` behavior is implemented today. It does not
replace the normative specification.

## API

Module and public composition:

- `apps/api/src/modules/account/account.module.ts`
- `apps/api/src/modules/account/public/index.ts`
- `apps/api/src/modules/account/public/account-public.module.ts`
- `apps/api/src/modules/account/public/account-profile-read.module.ts`
- `apps/api/src/modules/account/public/account-eligibility.module.ts`

Domain entities:

- `apps/api/src/modules/account/domain/entities/account.ts`
- `apps/api/src/modules/account/domain/entities/profile.ts`

Use cases and applications:

- `apps/api/src/modules/account/application/account/`
- `apps/api/src/modules/account/application/admin/`
- `apps/api/src/modules/account/application/preferences/`
- `apps/api/src/modules/account/application/profile/`
- `apps/api/src/modules/account/application/shared/`

Public contracts, services, and events:

- `apps/api/src/modules/account/public/account.service.ts`
- `apps/api/src/modules/account/public/account-admin.service.ts`
- `apps/api/src/modules/account/public/account-eligibility.service.ts`
- `apps/api/src/modules/account/public/account-profile-read.service.ts`
- `apps/api/src/modules/account/public/account-access.ports.ts`
- `apps/api/src/modules/account/public/account-admin-dtos/`
- `apps/api/src/modules/account/public/events/`

Persistence and presentation:

- `apps/api/src/modules/account/infrastructure/`
- `apps/api/src/modules/account/presentation/account/`
- `apps/api/src/modules/account/presentation/admin/`
- `apps/api/src/modules/account/presentation/responses/`

Public controllers use the `me`, `me/details`, `me/preferences`,
`profiles/me`, and `profiles/:username` surfaces. The administrative
controller uses the `accounts` surface, including lookup, lookup by id,
suspension, unsuspension, banning, unbanning, and role assignment.

## Cross-module integration

Account exposes services and ports for identity, eligibility, public profile,
administration, and data access. Auth consumes these interfaces to validate
access and publish lifecycle events without importing account infrastructure.

## Web

- `apps/web/src/features/account/access/`
- `apps/web/src/features/account/actions/`
- `apps/web/src/features/account/api/`
- `apps/web/src/features/account/public/`
- `apps/web/src/features/account/store/`
- `apps/web/src/features/account/types/`
- `apps/web/src/features/account/ui/`

Feature schemas and forms are under:

- `apps/web/src/features/account/ui/schemas/`
- `apps/web/tests/unit/forms/feature-forms.test.ts`

## Tests

API unit tests:

- `apps/api/tests/unit/domain/account.domain.spec.ts`
- `apps/api/tests/unit/use-cases/account.use-cases.spec.ts`
- `apps/api/tests/unit/use-cases/support/account/`
- `apps/api/tests/unit/use-cases/support/moderation/account-restriction.cases.ts`

Web unit tests related to the shared access surface and forms:

- `apps/web/tests/unit/access/`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
