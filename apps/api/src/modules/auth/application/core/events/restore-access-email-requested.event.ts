export const RESTORE_ACCESS_EMAIL_REQUESTED_EVENT = 'auth.restore-access-email.requested';

export class RestoreAccessEmailRequestedEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly token: string,
  ) {}
}
