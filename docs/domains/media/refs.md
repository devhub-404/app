# Media — current references

## API

Domain and public composition:

- `apps/api/src/modules/media/domain/media-object.ts`
- `apps/api/src/modules/media/public/index.ts`
- `apps/api/src/modules/media/public/media-service.port.ts`
- `apps/api/src/modules/media/public/media-public.module.ts`

Use cases and contracts:

- `apps/api/src/modules/media/application/use-cases/request-media-upload.command.ts`
- `apps/api/src/modules/media/application/use-cases/confirm-media-upload.command.ts`
- `apps/api/src/modules/media/application/use-cases/purge-expired-media-uploads.command.ts`
- `apps/api/src/modules/media/application/dtos/`
- `apps/api/src/modules/media/application/ports/`

Persistence, storage, and HTTP:

- `apps/api/src/modules/media/infrastructure/repositories/media-object.repository.ts`
- `apps/api/src/modules/media/infrastructure/storage/`
- `apps/api/src/modules/media/infrastructure/media.service.ts`
- `apps/api/src/modules/media/presentation/media.controller.ts`

The versioned `/media/uploads` controller exposes upload request and
confirmation. Cleanup is an operational use case consumed by scheduled
runtime routines.

## Current consumers

The public contract is consumed by owners that associate media, including
`article` and `account`. An owner does not access the repository or S3 client
directly.

## Tests

- `apps/api/tests/unit/domain/media.domain.spec.ts`
- `apps/api/tests/unit/use-cases/media.use-cases.spec.ts`
- `apps/api/tests/unit/use-cases/media-upload-abuse.use-cases.spec.ts`

There are currently no specific integration or UI tests for `media`.
