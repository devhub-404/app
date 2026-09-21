---
kind: architecture
status: current
scope: static-content
---

# Static content

Static editorial content belongs to the external `content` repository. The
`app` repository defines only the read contract and Astro renderer; it does
not duplicate this content inside `apps/web/src`.

## Collections

`apps/web/src/content.config.ts` defines the Astro collections:

- `cheatsheets`: Markdown localized to `en`, `pt`, and `es`;
- `roadmaps`: localized JSON manifest with sections and topics;
- `roadmapTopics`: Markdown for each roadmap topic;
- `codex`: localized JSON manifest with tags, branding, and links.

Entries accept `draft`, `published`, and `archived`; public pages select only
`published` entries and choose the entry corresponding to the request locale.

## Flow

```text
content repository
        ↓
Astro content loaders + schemas
        ↓
features/cheatsheet, codex, roadmap
        ↓
src/pages as route entry points
        ↓
AppLayout + feature public page
```

Detail pages redirect to `/404` when the slug does not exist or has no
published entry in the selected locale.

## Boundaries

- `cheatsheet`, `codex`, and `roadmap` are not API domain modules.
- Relationships with articles, news, projects, questions, or resources use
  those features' public contracts; static content does not copy their models.
- `tool` is a utility catalog defined in Web code, not a collection in the
  `content` repository.
- Institutional `home` content (about, FAQ, guidelines, legal, and
  contribution) belongs to the Web feature and i18n catalogs.
