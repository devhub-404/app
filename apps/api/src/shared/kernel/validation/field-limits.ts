/**
 * Cross-cutting persistence and transport limits.
 *
 * These constants are neutral contracts: schema, domain and DTO layers may all
 * depend on them, while ownership of validation semantics remains in each layer.
 */
export const FIELD_LIMITS = {
  title: 180,
  shortDescription: 320,
  slug: 200,
  url: 2048,
  body: 20_000,
  comment: 1_000,
  location: 240,
  reportReason: 80,
  reviewNote: 2_000,
  hideReason: 1_000,
  sourceName: 120,
  domain: 255,
  search: 120,
  moderationReason: 500,
  idempotencyKey: 128,
  internalSeverity: 32,
  tagSlug: 32,
} as const;
