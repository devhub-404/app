export const ACCOUNT_REACTIVATED_EVENT = 'account.reactivated';

export class AccountReactivatedEvent {
  constructor(public readonly userId: string) {}
}
