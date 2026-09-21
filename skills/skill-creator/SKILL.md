---
name: skill-creator
description: "Use only when creating or revising a reusable project skill whose recurring task needs a precise scope, actionable instructions, and objective validation."
---

# Skill creator

Use only for creating or revising a skill. Do not use for ordinary project
implementation or documentation.

Create exactly:

```text
skills/<lowercase-name>/SKILL.md
```

The Markdown file must begin with frontmatter containing only the required
fields:

```yaml
---
name: skill-name
description: Use when ...
---
```

Write one concrete objective, a discriminating `description`, essential
constraints, a short procedure, and observable validation. Preserve project
decisions and avoid generic advice, duplicate documentation, and unnecessary
resources.

Before concluding, verify the path, frontmatter, lowercase name, scope,
self-contained instructions, and total content limit of 500 tokens.
