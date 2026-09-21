export const ACCOUNT_CREATED_EVENT = 'account.created';

export type OAuthAvatarSource = {
  source: 'oauth';
  provider: 'google' | 'github';
  avatarUrl: string;
};

export class AccountCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly avatar?: OAuthAvatarSource,
  ) {}
}
