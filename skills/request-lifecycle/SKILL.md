---
name: request-lifecycle
description: "Use only when changing Web request middleware, request locals, session or route lifecycles, cancellation, response finalization, or server-error recovery."
---

# Request lifecycle

Trace the request from middleware order through context initialization,
access decision, route rendering, error recovery, and response finalization.
Keep request-scoped data in locals and preserve the distinction between
unauthenticated, unavailable, aborted, not-found, and server-error outcomes.

Use request-scoped API clients, forward only intentional headers, enforce
timeouts, and cancel work when the route or session revision changes. Browser
runtime initialization must be idempotent across Astro navigation; cleanup
must remove personal state when the session changes.

Preserve security headers, status codes, timing metadata, and the shared
`/404` and `/500` flow. Do not put feature business rules or persistent state
in middleware. Verify middleware order, locals, redirects, error recovery,
abort behavior, session transitions, and immutable-response handling.
