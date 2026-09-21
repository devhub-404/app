export const USER_MAGIC_LINK_LOGIN_REQUESTED_EVENT = 'auth.magic_link.login.requested';

export class MagicLinkLoginRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly token: string,
  ) {}
}
