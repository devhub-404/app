---
name: store
description: "Use only when changing shared Web application context state such as session, account, or cross-route runtime state."
---

# Store

Use a shared application store only for state shared across components or
routes and needed as context. Feature-owned stores are valid for that same
application context, such as account or session state. Keep state that exists
only during one page or interaction in local signals or `createStore`; do not
create a store layer to make local state testable.

Define the state owner, allowed transitions, initialization, reset behavior,
and consumers. Keep server authority and persisted data distinct from local
projections. Avoid storing duplicate API data, derived values that can be
computed, or state owned by another feature.

Verify hydration, session changes, logout/reset, stale data, and consumer
updates. A store must not become a hidden cross-feature dependency.
