---
name: content-collections
description: "Use only when changing Astro content collections, the external content repository, static editorial schemas, or localized content fallback."
---

# Content collections

The external `content` repository is the source of static editorial content.
Astro `content.config.ts` defines the loaders and schemas for cheatsheets,
roadmaps, roadmap topics, and Codex manifests. Do not duplicate those entries
inside `apps/web/src` or turn executable tools into content collections.

Preserve `draft`, `published`, and `archived` visibility rules. Public detail
routes select the requested locale and fall back to English when the localized
entry is unavailable; missing slugs or unpublished entries redirect to `/404`.

Verify collection schemas, loader paths, locale selection, publication
filtering, fallback behavior, and the external repository boundary.
