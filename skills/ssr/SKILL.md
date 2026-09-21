---
name: ssr
description: "Use only when changing Astro server rendering: page rendering mode, request data loading, await boundaries, streaming, hydration, or deferred regions."
---

# SSR

Use only for server-rendering and delivery decisions, not general UI structure
or product behavior.

Choose the least expensive valid mode: SSG when output is request-independent;
`server:defer` for independent secondary fragments with useful fallbacks; route
SSR when the response itself depends on request context; client JavaScript only
for browser behavior.

Trace `priority → acquisition → await → delivery → hydration → cache`. Keep
entity existence, status, redirects, canonical metadata, locale, auth context,
and primary content in the route SSR path. Set response metadata in
`src/pages`; feature components return data or UI state.

Do not use `server:defer` as a synonym for streaming: it creates a separate
request and changes caching, failure, serialization, and SEO behavior. Avoid
global awaits, redundant refetching, and client-only rendering without a
browser dependency.

Verify the actual blocking boundary and, when optimizing, latency, TTFB/LCP,
interactivity, cache behavior, or useful streamed output.
