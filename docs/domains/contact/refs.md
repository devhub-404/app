# Contact — current references

## API

- `apps/api/src/modules/contact/domain/contact-submission.policy.ts`
- `apps/api/src/modules/contact/application/use-cases/submit-contact-message.command.ts`
- `apps/api/src/modules/contact/application/dtos/`
- `apps/api/src/modules/contact/public/`
- `apps/api/src/modules/contact/presentation/contact.controller.ts`

The versioned `/contact` surface exposes public message submission. The module
uses Email's public contract for forwarding.

## Web

- `apps/web/src/features/contact/actions/`
- `apps/web/src/features/contact/api/`
- `apps/web/src/features/contact/public/`
- `apps/web/src/features/contact/ui/components/contact-form.component.tsx`
- `apps/web/src/features/contact/ui/pages/contact.page.astro`
- `apps/web/src/features/contact/ui/schemas/forms.schema.ts`

## Tests

- `apps/api/tests/unit/domain/contact.domain.spec.ts`
- `apps/api/tests/unit/use-cases/contact.use-cases.spec.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
