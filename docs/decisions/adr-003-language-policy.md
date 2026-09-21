---
kind: adr
status: current
---

# ADR-003: Language policy

## Context

The platform supports Portuguese, Spanish, and English. The repository also
contains technical documentation and official static editorial content. A
single canonical language is needed for maintenance, review, and fallback,
without treating localized product content as secondary.

The Web runtime already uses English as its default locale and falls back to
English when a localized static entry is unavailable.

## Decision

English is the canonical and default language for:

- the root README and repository documentation;
- architecture documents, ADRs, contribution rules, and operational guides;
- technical comments and examples when a shared language is useful;
- the baseline version of official static editorial content.

Portuguese and Spanish remain first-class product locales. Localized entries
use the same schema and identity as the English entry and may be added or
updated independently. When the requested locale is unavailable, the Web
falls back to English.

User-authored content keeps its original language. The platform does not
force translation of articles, comments, questions, projects, or other
community content into English.

Locale selection remains:

```text
locale cookie → Accept-Language → English default
```

## Consequences

- New technical documentation is written in English by default.
- Existing Portuguese technical documents are translated progressively,
  preserving their normative meaning and technical identifiers.
- Product UI and editorial content continue to expose `en`, `pt`, and `es`.
- A missing Portuguese or Spanish translation is a localization gap, not a
  reason to duplicate schemas or change route identity.
- Translation work must not silently change domain rules, product behavior,
  API contracts, or editorial meaning.

## Condition for review

Review this decision if the platform changes its supported locales, adopts a
different documentation governance model, or requires a different default
for public editorial content.
