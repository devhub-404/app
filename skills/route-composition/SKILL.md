---
name: route-composition
description: "Use only when composing an Astro route from layouts, feature public exports, queries, metadata, redirects, and route-level error handling."
---

# Route composition

The file in `src/pages` owns route composition. Import the application layout
and the feature's public page/query, load route data, pass metadata to the
layout and content to the feature, and set route-level redirects or errors.

A missing resource redirects to the shared `/404` route. An unexpected server
failure propagates to the server-error flow rather than rendering duplicated
fallback markup inside each feature page. Keep HTTP status, redirect, and
canonical metadata decisions in the route before rendering.

Pages compose features; they do not duplicate feature implementations, import
feature internals, or contain domain rules. Verify public imports, not-found
behavior, error propagation, metadata, and the route's request context.
