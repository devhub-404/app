# Report — current references

## API

- `apps/api/src/modules/report/domain/resource-report.ts`
- `apps/api/src/modules/report/domain/comment-report.ts`
- `apps/api/src/modules/report/domain/resource-report-target.policy.ts`
- `apps/api/src/modules/report/application/resource-report-target-access.service.ts`
- `apps/api/src/modules/report/application/use-cases/`
- `apps/api/src/modules/report/application/dtos/`
- `apps/api/src/modules/report/application/ports/`
- `apps/api/src/modules/report/infrastructure/`
- `apps/api/src/modules/report/public/`
- `apps/api/src/modules/report/presentation/report.controller.ts`

The versioned surface covers creation at `resources/:resourceId/reports` and
`comments/:commentId/reports`, triage listing, and review of each report type.

## Web

- `apps/web/src/features/report/access/`
- `apps/web/src/features/report/actions/`
- `apps/web/src/features/report/api/`
- `apps/web/src/features/report/public/`
- `apps/web/src/features/report/ui/components/`
- `apps/web/src/features/report/ui/schemas/forms.schema.ts`

## Tests

- `apps/api/tests/unit/domain/report.domain.spec.ts`
- `apps/api/tests/unit/use-cases/report.use-cases.spec.ts`
- `apps/web/tests/unit/forms/feature-forms.test.ts`
