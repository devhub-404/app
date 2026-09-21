---
kind: adr
status: current
---

# ADR-002: Incremental testing strategy

## Context

Authentication carries high risk because it involves credentials, sessions,
MFA, cookies, persistence, and account recovery. The rest of the system needs
evidence for business rules and access policies, but the first phase should
not create a broad matrix of integration, E2E, and UI tests.

On the Web, the behavior protected in this phase is presentation: route and
operation access plus validation of every form schema.

## Alternatives considered

- require integration and E2E tests for every owner;
- use only unit tests for everything, including authentication;
- use unit tests for rules and Web behavior, with selective integration for
  critical authentication flows;
- use uniform percentage coverage as the primary criterion.

## Decision

We use risk-proportional tests with the following scope:

### API

- unit tests for entities and domain rules;
- unit tests for services, policies, and use cases, including authorization
  decisions, invalid states, idempotency, and orchestration effects;
- integration tests only for authentication, covering critical flows with
  persistence and real protocols in the test environment;
- test infrastructure lives in `apps/api/tests` and does not pollute
  `apps/api/src`.

### Web

- unit tests for `access`, including route, role, capability, and operation
  state control;
- unit tests for every Zod schema associated with a form, including search
  forms without visible error messages;
- page-only state does not receive a store layer merely to make it testable;
- no new Web test types are introduced in this phase.

### Out of current scope

- E2E;
- general Web integration tests;
- API module integration tests other than authentication;
- one mandatory test file per endpoint, requirement, or owner;
- percentage coverage as an isolated goal.

## Organization and execution

- API unit tests: `apps/api/tests/unit/**/*.spec.ts`;
- API auth integration: `apps/api/tests/integration/auth.integration.spec.ts`;
- Web unit tests: `apps/web/tests/unit/**/*.test.ts`;
- unit test command: `pnpm test:unit`;
- critical auth flow: `pnpm test:integration:auth`;
- watch mode is a local convenience (`test:unit:watch`), not a CI stage or
  test category.

Shared cases (`*.cases.ts`) may reduce duplication within the suite, but the
test file that executes them remains the inventory reference.

## Consequences

- Authentication receives unit and integration evidence where persistence,
  cookies, and complete ceremonies require it.
- API rules are checked close to the code with fast, predictable isolation.
- The Web protects its presentation boundaries without turning every page into
  a browser test.
- New integration or E2E tests are added only when a failure cannot be
  discriminated by the current layer or operational risk changes.

## Condition for review

Review this decision when a new authentication ceremony must be validated,
when a bug crosses layers without being detectable by current tests, or when
the product requires browser, accessibility, or integration guarantees beyond
this scope.
