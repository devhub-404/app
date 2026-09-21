# Bookmark — current references

## API

- `apps/api/src/modules/bookmark/domain/bookmark.ts`
- `apps/api/src/modules/bookmark/domain/bookmark-target.policy.ts`
- `apps/api/src/modules/bookmark/application/bookmarks/`
- `apps/api/src/modules/bookmark/application/use-cases/`
- `apps/api/src/modules/bookmark/infrastructure/`
- `apps/api/src/modules/bookmark/public/`
- `apps/api/src/modules/bookmark/presentation/bookmark.controller.ts`

The versioned surface covers save/remove at `/bookmarks/:resourceId`,
synchronization at `/me/bookmarks/sync`, and listing at `/me/bookmarks`.

## Web

There is no independent bookmark Web feature in the current structure;
content owners compose this capability through their own public contracts.

## Tests

- `apps/api/tests/unit/domain/bookmark.domain.spec.ts`
- `apps/api/tests/unit/use-cases/bookmark.use-cases.spec.ts`
