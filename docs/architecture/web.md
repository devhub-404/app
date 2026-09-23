---
kind: architecture
status: current
scope: web
---

# Web architecture

The Web uses Astro for structure, SSR, pages, and content integration. SolidJS
is used for islands that need interaction, reactive state, or browser APIs.

## Estrutura

```text
apps/web/src/
├── app/          runtime global, middleware, acesso e shell
├── pages/        Astro route entry points
├── features/     owners de apresentação e interação
├── shared/       capacidades técnicas sem ownership
├── content.config.ts
└── worker.ts
```

Feature layers are optional. `access`, `actions`, `api`, `cache`, `domain`,
`i18n`, `schemas`, `services`, `store`, `types`, `ui`, and `public` may exist
when they have a real responsibility.

- `access`: local capability and visibility predicates;
- `actions`: coordination of feature operations;
- `api`: HTTP client and mapping;
- `cache`: replaceable read projections;
- `domain`: local presentation rules when justified;
- `schemas`: form validation, including search;
- `store`: application-wide context state only;
- `ui`: Astro/Solid pages and components;
- `public`: stable entry points for pages;
- `shared`: technical primitives, not feature state.

State exclusive to a page remains in signals or `createStore` inside that page
or composition. A store layer is not created for this case.

## Page composition

`src/pages` is the route entry point. It can:

1. import the application layout;
2. import the feature's page and public query;
3. fetch data;
4. pass metadata to the layout and content to the page;
5. redirect to the shared not-found page when the resource does not exist;
6. delegate server errors to the application's error flow.

Pages must not duplicate feature implementations or contain business rules.
Web features do not import one another's internals. The page is the explicit
composition point.

## Access and state

- middleware prepares request context and protects routes when possible before
  rendering;
- the backend remains the authorization authority;
- `access` controls local presentation of permitted operations;
- an operation may be hidden or disabled according to UI policy, but this
  never replaces API authorization;
- `features/auth` owns the authentication source of truth: the current auth
  session, resolution state, logout single-flight, private-response
  invalidation, and cross-tab lifecycle synchronization;
- the auth client runtime and lifecycle bus are created lazily from the
  hydrated `AuthRuntime` only; SSR may import auth modules but must not create
  browser synchronization or mutable client coordinators;
- `features/account` owns the account projection (`$account`) and its
  `/me/details` bootstrap; it never changes authentication state;
- `src/app/runtime/AppRuntime.tsx` is composition only. It mounts auth and
  account runtimes with `client:load`, passing the SSR session and account
  projections into them;
- `AppLayout` and the shell receive SSR projections only for initial render and
  hydration. Authenticated transitions are confirmed through
  `/api/v1/sessions/current`; account identity is then loaded from `/api/v1/me`
  or `/api/v1/me/details` according to the route;
- the lifecycle bus uses `BroadcastChannel`, a same-document event, and a
  `localStorage` fallback. It publishes `available` only after the producing
  tab confirms the session, and publishes one `invalidated` event per active
  logout/invalidation;
- Web consumers outside `features/auth` use its public server/session entries;
  they do not import auth API or runtime internals directly;
- features do not own local session or authenticated-account stores; they
  consume the auth and account projections or use the private transport;
- temporary page state does not go into a global store.

## Content

Static content belongs to the external `content` repository and is loaded by
Astro collections. It must not be copied into a feature or duplicated inside
`apps/web/src`.

## Current verification

- access and presentation policies: unit tests;
- all form schemas: unit tests, including search schemas;
- middleware and metadata: unit tests;
- `astro check` and Worker build: structural validation;
- authentication browser flows are covered by `apps/web/tests/e2e/authentication`;
- there are no broader Web integration tests at this time.
