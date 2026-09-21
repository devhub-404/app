# Web features without an API owner

The following features exist for Web composition and presentation. They must
not be treated as modules equivalent to API owners.

## Static content

- `cheatsheet`: listing and detail pages for cheatsheets from the `content`
  repository;
- `codex`: listing and detail pages for Codex entries, with navigation to
  related API content and cheatsheets/roadmaps;
- `roadmap`: listing, detail, and topic pages for roadmaps from the `content`
  repository;
- `tool`: browser utility catalog, currently JSON formatter and Base64.

The public entry points for these features are in:

- `apps/web/src/features/cheatsheet/public/`
- `apps/web/src/features/codex/public/`
- `apps/web/src/features/roadmap/public/`
- `apps/web/src/features/tool/public/`

The corresponding Astro routes are in `apps/web/src/pages/`:

- `/cheatsheets` e `/cheatsheets/[...slug]`;
- `/codex` e `/codex/[slug]`;
- `/roadmaps` e `/roadmaps/[slug]`;
- `/tools` e `/tools/[slug]`.

## Application composition

- `home`: institutional pages, global search, 404, and server-error pages;
- `panel`: administrative composition that consumes owners' public contracts
  without owning the administered content;
- `platform`: operational status consumed by the Web.

Entrypoints:

- `apps/web/src/features/home/public/`
- `apps/web/src/features/panel/public/`
- `apps/web/src/features/platform/public/`

These features may compose data from multiple owners, but final route
composition remains in `apps/web/src/pages/`.
