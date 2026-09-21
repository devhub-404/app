export const ACCOUNT_DELETION_RETENTION_DAYS = 30;
export const ACCOUNT_DELETION_RETENTION_MS = ACCOUNT_DELETION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function accountDeletionRetentionCutoff(now: Date): Date {
  return new Date(now.getTime() - ACCOUNT_DELETION_RETENTION_MS);
}

export function isWithinAccountDeletionRetention(requestedAt: Date | string, now: Date): boolean {
  // Account projections may cross a JSON boundary before reaching the use case.
  // Normalize here so the retention rule remains correct for both Date objects
  // and their serialized ISO representation.
  const requestedAtDate = requestedAt instanceof Date ? requestedAt : new Date(requestedAt);

  return requestedAtDate.getTime() >= accountDeletionRetentionCutoff(now).getTime();
}
