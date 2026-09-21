export const ACCOUNT_STATUS_CHANGED_EVENT = 'account.status.changed';

export type AccountStatus = 'active' | 'deactivated' | 'suspended' | 'banned';

/** Compatibility envelope for consumers that handle any account status transition. */
export class AccountStatusChanged {
  constructor(
    public readonly userId: string,
    public readonly status: AccountStatus,
  ) {}
}
