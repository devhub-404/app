---
name: test-strategy
description: "Use only when deciding, organizing, or implementing automated tests under the project's current risk-based test scope."
---

# Test strategy

API unit tests cover domain rules, services, policies, and use cases. The only
API integration scope is critical authentication, including persistence and
protocol ceremonies. Web unit tests cover access predicates, routes, roles,
capabilities, every form schema including search schemas, and the existing
request/metadata helpers without becoming general UI tests.

Keep test infrastructure outside `src`. Do not add E2E or general integration
tests in the current phase, create tests solely for percentage coverage, or
move page-only state into a store to simplify testing. `test:unit:watch` is a
local convenience, not a test category.

Choose the narrowest test layer that can expose the failure. Verify behavior,
not implementation details, and update tests when a normative contract changes.
