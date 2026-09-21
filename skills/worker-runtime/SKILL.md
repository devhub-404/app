---
name: worker-runtime
description: "Use only when changing Cloudflare Worker entry points, Service Bindings, Wrangler configuration, or local versus production runtime behavior."
---

# Worker runtime

Production uses separate Web, API, Assistant, and Purge Workers. Web binds to
API and Assistant; Purge binds to API; bindings are directional. The API Worker
forwards NestJS/Fastify to the Cloudflare Container, which is ephemeral and not
a source of persistent state.

Development uses local Astro and NestJS processes over `API_URL`. `dev` runs
watchers; `start` builds and runs Workers with `wrangler dev --local`; Purge is
started separately. Keep Worker entry points in runtime locations and keep
seeds, reset, Docker Compose, watchers, and orchestration outside `src`.

Verify bindings, entry points, environment selection, local HTTP behavior, and
deployment dry-runs without assuming reverse bindings.
