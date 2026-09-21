export const ACCOUNT_DEACTIVATED_EVENT = 'account.deactivated';

export class AccountDeactivatedEvent {
  constructor(public readonly userId: string) {}
}
