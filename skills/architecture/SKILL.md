---
name: architecture
description: "Use only for repository-wide ownership, dependency direction, boundary, composition, or architecture decisions across API, Web, packages, Workers, and documentation."
---

# Architecture

Model the actual flow as `entry → orchestration → policy → contract → adapter → external system` and identify who owns each invariant. Check imports, public exports, runtime calls, generated contracts, and change propagation.

Preserve the current boundaries: API is a modular monolith; Web features do
not import one another's internals; page composition happens in `pages`; API
and feature `public` surfaces are explicit; `shared` has no product owner;
Workers and packages have independent runtime or transport responsibilities.

Do not introduce layers, wrappers, cross-feature imports, or abstractions only
to match a diagram. Support a boundary change with a concrete cycle, leaked
detail, duplicated policy, unclear ownership, or unnecessary propagation.

This skill decides cross-cutting structure. It does not implement one layer's
domain rule, query, UI behavior, or test case.
