---
name: actions
description: "Use only when coordinating a Web feature operation between UI intent, client calls, local state, cache invalidation, and returned result."
---

# Actions

An action coordinates a feature operation; it does not become a second domain
or API layer. Validate the input at the form/schema boundary, call the feature
client, map the result to feature state, and expose explicit success/error
outcomes to the UI.

Keep feature actions independent from other feature internals. Use public
contracts for cross-feature needs, preserve request cancellation and stale
result handling, and invalidate or update only affected cache/context state.
Do not hide authorization, business rules, or transport construction inside an
action.

Verify success, API failure, validation failure, cancellation, and repeated
submission behavior with focused tests where the action owns meaningful logic.
