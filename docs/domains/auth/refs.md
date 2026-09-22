# Auth — current references

This file records where `auth` behavior is implemented today. It is
implementation evidence, not a second specification.

## API

Module and public composition:

- `apps/api/src/modules/auth/auth.module.ts`
- `apps/api/src/modules/auth/public/index.ts`
- `apps/api/src/modules/auth/public/auth-public.module.ts`
- `apps/api/src/modules/auth/presentation/auth.guard.ts`

Domain entities and services:

- `apps/api/src/modules/auth/domain/entities/`
- `apps/api/src/modules/auth/domain/services/`

Use cases and applications:

- `apps/api/src/modules/auth/application/auth/`
- `apps/api/src/modules/auth/application/emails/`
- `apps/api/src/modules/auth/application/magic-link/`
- `apps/api/src/modules/auth/application/mfa/`
- `apps/api/src/modules/auth/application/oauth/`
- `apps/api/src/modules/auth/application/passkeys/`
- `apps/api/src/modules/auth/application/password/`
- `apps/api/src/modules/auth/application/sessions/`
- `apps/api/src/modules/auth/application/shared/`

Infrastructure and presentation:

- `apps/api/src/modules/auth/infrastructure/`
- `apps/api/src/modules/auth/presentation/auth/`
- `apps/api/src/modules/auth/presentation/pipes/`
- `apps/api/src/modules/auth/presentation/utils/`

Presentation controllers cover password registration/login, magic link, OAuth,
and passkey; email verification and changes; MFA/TOTP and recovery codes;
account recovery; possession proof; authentication methods; authenticated
account lifecycle; and sessions.

## Cross-module integration

Auth exposes `SessionAccessValidationPort`, `PossessionProofServicePort`,
`AuthPublicModule`, and configuration/HTTP contracts in
`apps/api/src/modules/auth/public/`. Account state is obtained through
account's public interfaces without importing its infrastructure.

## Web

- `apps/web/src/features/auth/store/` — canonical browser authentication
  state and session revisions;
- `apps/web/src/features/auth/runtime/` — session resolution, logout
  coordination, request invalidation, and cross-tab synchronization;
- `apps/web/src/features/auth/api/` — browser and SSR clients for
  `/api/v1/sessions/current` and related auth-session operations;
- `apps/web/src/features/account/store/account-projection.store.ts` — account
  projection consumed by the shell and features; it is not an auth source of
  truth;
- `apps/web/src/app/runtime/AppRuntime.tsx` — application composition of the
  auth and account runtimes;
- `apps/web/src/app/access/` — route resolution and protection;
- `apps/web/src/features/auth/access/`
- `apps/web/src/features/auth/actions/`
- `apps/web/src/features/auth/api/`
- `apps/web/src/features/auth/public/`
- `apps/web/src/features/auth/ui/`
- `apps/web/src/features/auth/utils/`

Current schemas and forms are in:

- `apps/web/src/features/auth/ui/schemas/`
- `apps/web/tests/unit/forms/auth-forms.test.ts`

## Tests

Authentication surface integration:

- `apps/api/tests/integration/auth.integration.spec.ts`
- `apps/api/tests/integration/support/auth/`
- `apps/api/tests/integration/support/persistence/auth.cases.ts`

API unit tests:

- `apps/api/tests/unit/domain/auth.domain.spec.ts`
- `apps/api/tests/unit/services/auth-services.spec.ts`
- `apps/api/tests/unit/use-cases/auth.use-cases.spec.ts`
- `apps/api/tests/unit/use-cases/support/auth/`

Feature-related Web unit tests:

- `apps/web/tests/unit/access/`
- `apps/web/tests/unit/forms/auth-forms.test.ts`
