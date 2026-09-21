---
name: localization
description: "Use only when changing locale resolution, translation catalogs, localized validation, or language fallback for the en/pt/es product."
---

# Localization

The supported locales are `en`, `pt`, and `es`; English is the default and
fallback. Resolve locale from cookie, then `Accept-Language`, then the default.
Keep `pt` mapped to the appropriate HTML language value and preserve stable
translation keys across catalogs.

Use locale-aware schemas and server-derived locale in SSR. Do not translate
user-authored content automatically, change slugs or contracts for a locale,
or duplicate a feature to support a language. Missing translations are
fallback/localization gaps, not domain behavior.

Verify catalog keys, fallback behavior, HTML locale, SSR output, and localized
validation messages.
