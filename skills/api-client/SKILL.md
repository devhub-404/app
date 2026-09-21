---
name: api-client
description: "Use only when changing the Web layer that calls HTTP endpoints, maps API results, selects public/private clients, or handles transport errors."
---

# API client

Keep endpoint paths, request parameters, request bodies, response mapping, and
transport error handling in the feature client layer. Consume the generated
OpenAPI types instead of recreating endpoint contracts. Select the public or
authenticated client according to request context, not UI convenience.

Do not place business rules, route composition, form validation, or global
state in the client. Preserve abort signals, pagination, cache semantics,
error codes, and the distinction between an absent resource and a failed
request.

Verify paths and payloads against the generated contract and test mappings or
error branches owned by the client.
