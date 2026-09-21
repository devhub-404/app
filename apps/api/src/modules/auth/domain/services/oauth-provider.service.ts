export type OAuthProviderName = 'github' | 'google';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string | undefined;
  idToken?: string | undefined;
  tokenType: 'Bearer';
  scope?: string | undefined;
}

export interface OAuthUserProfile {
  provider: OAuthProviderName;
  providerUserId: string;
  email: string;
  /** True only when the provider itself attests control of this email. */
  emailVerified: boolean;
  displayName: string;
  avatarUrl: string;
}

export interface OAuthAuthorizationOptions {
  redirectUri: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod?: 'S256';
  scope?: string[];
  prompt?: string;
  accessType?: 'offline';
}

export interface OAuthExchangeCodeOptions {
  redirectUri: string;
  code: string;
  codeVerifier: string;
}

export abstract class OAuthProvider {
  readonly name!: OAuthProviderName;

  abstract getAuthorizationUrl(options: OAuthAuthorizationOptions): string;
  abstract exchangeCodeForTokens(options: OAuthExchangeCodeOptions): Promise<OAuthTokens>;
  abstract getUserProfile(accessToken: string): Promise<OAuthUserProfile>;
}
