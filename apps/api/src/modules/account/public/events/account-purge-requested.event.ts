export const ACCOUNT_PURGE_REQUESTED_EVENT = 'account.purge.requested';

/**
 * Pre-delete purge barrier emitted after the deletion retention window elapsed.
 * Handlers must be idempotent. A rejected handler prevents physical Account
 * deletion so the next purge run can retry safely.
 */
export class AccountPurgeRequestedEvent {
  constructor(public readonly userId: string) {}
}
