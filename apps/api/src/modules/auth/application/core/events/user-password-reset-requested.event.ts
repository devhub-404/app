export const USER_PASSWORD_RESET_REQUESTED_EVENT = 'auth.user.password.reset.requested';

export class UserPasswordResetRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly token: string,
  ) {}
}
