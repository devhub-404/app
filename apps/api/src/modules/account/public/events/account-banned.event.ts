export const ACCOUNT_BANNED_EVENT = 'account.banned';

export class AccountBannedEvent {
  constructor(public readonly userId: string) {}
}
