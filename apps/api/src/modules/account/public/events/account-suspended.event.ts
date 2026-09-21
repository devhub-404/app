export const ACCOUNT_SUSPENDED_EVENT = 'account.suspended';

export class AccountSuspendedEvent {
  constructor(
    public readonly userId: string,
    public readonly lockedUntil: string | null,
  ) {}
}
