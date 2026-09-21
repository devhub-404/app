---
name: schemas
description: "Use only when creating or changing Zod schemas for Web forms, search forms, query input, or localized validation messages."
---

# Schemas

Every Web form has a Zod schema, including search forms that do not display
errors. Keep field normalization, required values, bounds, formats, and
localized messages in the schema rather than duplicating validation in UI
handlers.

Create locale-aware schemas when messages depend on the request or active
locale. Keep inferred/input types aligned with the schema and avoid treating a
compatibility export as a different source of rules.

Test valid input, each meaningful invalid condition, normalization, limits,
and locale-dependent messages. Do not put API calls, authorization, or domain
transitions in a schema.
