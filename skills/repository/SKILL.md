---
name: repository
description: "Use only when changing or optimizing database repositories and persistence queries: query shape, round-trips, row amplification, pagination, caching, or indexing."
---

# Repository

Use only for database access and repository query behavior, not domain rules,
API contracts, interface structure, or client-side cache persistence.

Trace:

```text
selection → ordering → pagination → enrichment → aggregation → mapping
```

Check join cardinality: `1:N` and `N:N` joins before pagination can amplify
rows and change page membership. Inspect real callers, snapshot needs, and
repeated reads before changing the query.

Prefer the smallest correct projection; paginate candidates before enrichment;
keep item/count semantics equivalent; use deterministic ordering; choose offset
or cursor pagination from access depth; infer indexes from `WHERE`, `JOIN`,
`ORDER BY`, and `GROUP BY`; optimize query shape before caching; preserve ORM
type safety and visible SQL.

Validate with `EXPLAIN (ANALYZE, BUFFERS)` and compare correctness, round-trips,
latency, rows before pagination, amplification, aggregation, buffers, sorting,
and index use. Do not claim improvement from cleaner SQL alone.
