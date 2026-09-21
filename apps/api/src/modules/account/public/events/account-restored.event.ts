export const ACCOUNT_RESTORED_EVENT = 'account.restored';

export class AccountRestoredEvent {
  constructor(public readonly userId: string) {}
}
