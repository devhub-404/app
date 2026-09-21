export const USER_EMAIL_VERIFICATION_REQUESTED_EVENT = 'auth.user.email.verification.requested';

export class UserEmailVerificationRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly token: string,
  ) {}
}
