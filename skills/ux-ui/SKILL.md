---
name: ux-ui
description: "Use only when creating or materially changing user-facing screen behavior across viewports: hierarchy, navigation, affordances, accessibility, feedback, or consequential actions."
---

# UX/UI

Use only for rendered user experience and interaction behavior across
viewports, not API, domain, persistence, or server-rendering decisions.

Trace `context → priority → layout → affordance → feedback → next step/recovery`.
Reflow by task priority while preserving reading and focus order. Every control
must match real behavior and expose appropriate focus, selected, disabled,
loading, and outcome states; hover cannot be the only signal.

Preserve content meaning, reachable touch targets, semantic names, meaningful
text alternatives, and safe cancellation for destructive actions. Do not use
color, position, hover, animation, or emphasis as the sole carrier of meaning.

Verify representative wide/narrow viewports, keyboard order, primary-action
reachability, accessible names, state feedback, and cancellation/recovery.
Report only demonstrated hierarchy, affordance, accessibility, or recovery
failures; product rules remain outside this skill.
