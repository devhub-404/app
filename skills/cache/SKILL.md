---
name: cache
description: "Use only when changing client-side cached projections, IndexedDB persistence, account scoping, synchronization, or invalidation."
---

# Cache

Treat a client cache as a replaceable projection, never as the source of
truth. Define the owner, key, account/session scope, freshness marker,
serialization shape, failure behavior, and invalidation trigger before
editing it.

Keep persistence adapters behind the existing local-storage boundary. Scope
personal data by account, clear it on logout or account change, close database
handles, and ignore stale or aborted synchronization results. Do not move
domain rules, HTTP construction, or global context ownership into a cache.

Verify cold reads, cache hits, stale data, unavailable storage, account
isolation, synchronization cancellation, invalidation, and recovery after a
failed remote request. Measure whether the cache changes the requested read
path before adding it.
