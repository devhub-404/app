---
name: ui-composition
description: "Use only for the semantic structure of Astro/Tailwind layouts: regions, parent-owned composition, component boundaries, sizing, and responsive reflow."
---

# UI composition

Represent each unit as `nature → role → children → structural metadata`.
Nature is semantic, not positional: `header`, `sidebar`, `main`, `secondary`,
`nav`, and `footer` do not mean top, left, right, or bottom.

`BaseLayout` owns `html/head/body`; `AppLayout` owns `header`, `workspace`,
and `footer`; `workspace` owns `sidebar` and `main`. Do not add another
top-level layout for a feature variation.

The parent owns order, flow, alignment, gap, sizing, and responsive reflow.
Children own internal composition. Create a component only for independent
semantics, responsibility, or recurring variation. Start with Tailwind in the
owning component and extract stable recurring compositions.

Verify the owning parent and semantic relation in code. Avoid positional
semantics, sibling coordination, one-off wrappers, duplicated components, and
global CSS that overrides local composition.
