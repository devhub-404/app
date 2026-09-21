# Email — current references

## API

Public contract and composition:

- `apps/api/src/modules/email/public/email.service.port.ts`
- `apps/api/src/modules/email/public/email-config.port.ts`
- `apps/api/src/modules/email/public/email-public.module.ts`
- `apps/api/src/modules/email/public/index.ts`

Application and templates:

- `apps/api/src/modules/email/application/use-cases/command/send-email.command.ts`
- `apps/api/src/modules/email/application/templates/`
- `apps/api/src/modules/email/public/templates.ts`

Providers and configuration:

- `apps/api/src/modules/email/infrastructure/local-email.service.ts`
- `apps/api/src/modules/email/infrastructure/cloudflare-email.service.ts`
- `apps/api/src/modules/email/infrastructure/mail.module.ts`

The module has no own HTTP controller. Auth, contact, and other owners request
delivery through the public contract.

## Known consumers

Authentication templates and flows use the public service for email
verification, magic links, password/account recovery, possession proof, and
access restoration. Concrete usage remains in the calling owners.

## Tests

- `apps/api/tests/unit/use-cases/email.use-cases.spec.ts`
- `apps/api/tests/unit/use-cases/support/auth/email-flows.cases.ts`

There is currently no `email.integration.spec.ts`; the historical reference
that claimed this file was discarded.
