# Agent operating instructions

These instructions define how work is investigated, proposed, implemented,
and verified in the `app` repository.

## Scope and authority

Follow this order when sources disagree:

1. explicit user decision for the current task;
2. this file;
3. current ADRs in `docs/decisions/`;
4. normative owner specifications in `docs/domains/<owner>/spec.md`;
5. implementation references in `docs/domains/<owner>/refs.md`;
6. current code, manifests, and generated contracts.

## Task frame

Before acting, reduce the task to the smallest frame that preserves its
material factors:

- target: what must be established, produced, decided, or changed;
- determining relations: dependencies, ownership, transformations, and
  runtime flow;
- constraints: invariants, boundaries, compatibility, and scope;
- evidence: files, contracts, commands, or observations that can distinguish
  alternatives;
- uncertainty: unresolved alternatives that could change the result.

Keep observations, assumptions, hypotheses, inferences, and conclusions
distinct. Acquire more context only when it can change the frame, intervention,
scope, or verification.

## Operating procedure

1. Read the applicable current documentation and inspect the smallest relevant
   code surface.
2. Select the minimum skill from `skills/` whose `description` matches the
   task. Read that skill completely before applying it.
3. For a non-trivial change, present a concise proposal with scope,
   invariants, skill choice, risks, and verification before editing.
4. After approval, change the authoritative owner with the smallest sufficient
   intervention. Do not create parallel sources of truth.
5. Re-check imports, contracts, behavior, and affected documentation.
6. Run validation proportional to the change and report what was and was not
   verified.

If new evidence materially changes the affected scope, architecture, risk, or
required skill, stop and revise the proposal before continuing.

## Branches and safe recovery

The repository uses two protected permanent branches:

- `main`: the production-ready history. Only reviewed Pull Requests may enter
  it; each release is tagged with a version such as `v1.0.0`.
- `develop`: the integration branch for approved work that is not yet released.

Work branches are temporary and must be created from `develop`:

```text
feature/<scope>-<slug>
fix/<scope>-<slug>
refactor/<scope>-<slug>
test/<scope>-<slug>
docs/<scope>-<slug>
chore/<scope>-<slug>
```

Urgent production corrections use `hotfix/<scope>-<slug>`, created from
`main`. A hotfix is merged into `main` first and then incorporated into
`develop`. Do not create permanent `staging`, `qa`, or `release` branches
unless the release process later demonstrates a concrete need for them.

Never commit directly to `main` or `develop`, force-push them, rewrite their
history, or use destructive commands to recover from an error. Do not rebase
or force-push a shared branch. Prefer a new corrective branch and a reviewed
Pull Request. Revert an already merged change with `git revert`, preserving a
recoverable history.

### AI task examples

For a new article form, an agent should:

1. Confirm the repository root, current branch, and clean or intentionally
   staged working tree.
2. Update from `develop` without discarding local work.
3. Create `feature/article-form` from `develop`.
4. Inspect the applicable docs and skill, state the proposal when required,
   and implement only the approved scope.
5. Create small checkpoints for independently recoverable stages, such as the
   form structure, validation, and tests.
6. Run the relevant checks, report the evidence, and open a Pull Request to
   `develop`; never merge it itself unless explicitly authorized.

For a bug in article access, the same flow uses
`fix/article-access-<slug>` and targets `develop`. A refactor that preserves
behavior uses `refactor/<scope>-<slug>`; it must not silently change RN, RF,
authorization, or public contracts.

For a production incident, the agent creates `hotfix/<scope>-<slug>` from
`main`, applies the minimum correction, validates it, and proposes a Pull
Request to `main`. After release, the same fix must be merged or cherry-picked
into `develop` so the branches do not diverge.

To undo a merged change, the agent creates a corrective branch from the
affected protected branch, reverts the specific merge or commit, validates the
result, and opens a Pull Request. It must not reset the protected branch.

There is no automatic permission to change product behavior. Changes to RN,
RF, authorization, security, ownership, or public contracts still require a
proposal and explicit decision, even when made on an isolated branch.

## Skill selection

Skills are project-specific lenses, not mandatory layers or architecture
templates. Use the `name` and `description` frontmatter in each
`skills/*/SKILL.md` to select one. Prefer one skill; combine skills only when
the task crosses a real boundary, such as interface structure plus SSR.

If no existing skill matches, use these instructions and the current docs. Do
not create a new skill merely to complete a one-off task. Create one only when
the same reasoning and verification will recur.

## Repository invariants

- `apps/api` is a NestJS modular monolith; modules expose cross-module
  contracts through `public`.
- API layers remain directed from entry point and orchestration toward domain
  policy, ports/contracts, adapters, and external systems.
- `apps/web` uses Astro pages as route composition entry points and SolidJS for
  interactive islands; features do not import one another's internals.
- Web cross-feature composition belongs in `src/pages`.
- Web `store` is for application context state; page-only state stays local.
- Every Web form, including search, has a Zod schema.
- `packages/api-contract/openapi.json` is generated by the API and is not
  edited manually.
- Worker entry points stay in runtime locations; seeds, reset, watchers,
  Docker Compose, and development orchestration stay outside `src`.
- The API is the final authorization authority.
- Do not change `src` structure merely to accommodate tests or development
  tooling.

## Documentation and domain governance

Use `docs/README.md` as the documentation index. Use `spec.md` for normative
behavior and `refs.md` for current implementation evidence. Keep paths out of
`spec.md` and rules out of `refs.md`.

English is the canonical language for repository documentation, ADRs,
contribution rules, and the baseline of official static editorial content.
Product locales remain `en`, `pt`, and `es`. Do not translate user-authored
content or change domain meaning while translating documentation.

Changes to RN/RF, capabilities, ownership, states, authorization, product
security, or functional contracts require a prior proposal and decision.
`fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, and `style`
may proceed directly when they preserve the existing product behavior.

## Commands and validation

Run commands from the repository root:

```bash
pnpm dev:setup
pnpm dev
pnpm start
pnpm start:purge
```

Use the smallest relevant validation set:

```bash
pnpm check
pnpm typecheck
pnpm test:unit
pnpm test:integration:auth
pnpm build
pnpm openapi
```

`pnpm dev` runs the local Web/API watchers. `pnpm start` builds and runs the
Workers with Wrangler. Authentication is the only integration-test scope at
this stage; Web tests cover access boundaries and all form schemas.

Do not claim a test passed unless its command completed successfully. For
documentation-only changes, at minimum run whitespace/diff validation and
check links or paths affected by the change.

## Commits and handoff

Use Conventional Commit style:

```text
type(scope): short description
```

Examples include `fix(auth): reject expired recovery token`,
`refactor(article): isolate query projection`, and
`docs: explain local worker runtime`.

The final handoff must state:

- what changed and where;
- what evidence was checked;
- which commands passed or were not run;
- remaining uncertainty or follow-up work.
