export const RATE_LIMIT_POLICIES = {
  global: { limit: 600, ttl: 60_000, blockDuration: 30_000 },
  local: { limit: 60, ttl: 60_000, blockDuration: 5 * 60_000 },
  account: { limit: 90, ttl: 60_000, blockDuration: 5 * 60_000 },
  admin: { limit: 60, ttl: 60_000, blockDuration: 10 * 60_000 },
  availability: { limit: 30, ttl: 60_000, blockDuration: 5 * 60_000 },
  authInteractive: { limit: 20, ttl: 60_000, blockDuration: 5 * 60_000 },
  authSensitive: { limit: 10, ttl: 10 * 60_000, blockDuration: 15 * 60_000 },
  authEmail: { limit: 5, ttl: 10 * 60_000, blockDuration: 15 * 60_000 },
  securitySettings: { limit: 30, ttl: 60_000, blockDuration: 10 * 60_000 },
  sessions: { limit: 90, ttl: 60_000, blockDuration: 5 * 60_000 },
  contact: { limit: 10, ttl: 10 * 60_000, blockDuration: 30 * 60_000 },
  mediaUploads: { limit: 20, ttl: 60_000, blockDuration: 5 * 60_000 },
} as const;
