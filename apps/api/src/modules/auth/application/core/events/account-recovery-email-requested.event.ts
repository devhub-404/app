export const ACCOUNT_RECOVERY_EMAIL_REQUESTED_EVENT = 'auth.account-recovery-email.requested';

export class AccountRecoveryEmailRequestedEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly token: string,
  ) {}
}
