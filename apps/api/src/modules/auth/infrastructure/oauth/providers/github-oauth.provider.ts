import { Inject, Injectable } from '@nestjs/common';
import type {
  OAuthAuthorizationOptions,
  OAuthExchangeCodeOptions,
  OAuthProvider,
  OAuthTokens,
  OAuthUserProfile,
} from '@/modules/auth/domain/services/oauth-provider.service';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

@Injectable()
export class GithubOAuthProvider implements OAuthProvider {
  readonly name = 'github' as const;

  private readonly authUrl = 'https://github.com/login/oauth/authorize';
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userinfoUrl = 'https://api.github.com/user';
  private readonly emailsUrl = 'https://api.github.com/user/emails';
  constructor(@Inject(AUTH_CONFIG) config: AuthConfig) {
    this.clientId = config.oauth.github.clientId;
    this.clientSecret = config.oauth.github.clientSecret;
  }

  private readonly clientId: string;
  private readonly clientSecret: string;

  getAuthorizationUrl(options: OAuthAuthorizationOptions): string {
    const scope = options.scope?.join(' ') || 'read:user user:email';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: options.redirectUri,
      response_type: 'code',
      scope,
      code_challenge: options.codeChallenge,
      code_challenge_method: options.codeChallengeMethod ?? 'S256',
      state: options.state,
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(options: OAuthExchangeCodeOptions): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: options.code,
      code_verifier: options.codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: options.redirectUri,
    });

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: body.toString(),
    });

    if (!res.ok) throw new Error(`Github token error: ${await res.text()}`);

    const data = (await res.json()) as unknown;
    if (!isGithubTokenResponse(data)) {
      throw new Error('Github token response is invalid');
    }

    return {
      accessToken: data.access_token,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      idToken: data.id_token,
      tokenType: 'Bearer',
      scope: data.scope,
    };
  }

  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    };

    const userInfoResponse = await fetch(this.userinfoUrl, { headers });

    if (!userInfoResponse.ok) throw new Error(`Github userinfo error: ${userInfoResponse.status}`);

    const userInfo = (await userInfoResponse.json()) as unknown;
    if (!isGithubUserInfo(userInfo)) {
      throw new Error('Github userinfo response is invalid');
    }

    const emailsResponse = await fetch(this.emailsUrl, { headers });

    if (!emailsResponse.ok) throw new Error(`Github emails error: ${emailsResponse.status}`);

    const emailsValue = (await emailsResponse.json()) as unknown;
    if (!Array.isArray(emailsValue)) {
      throw new Error('Github emails response is invalid');
    }
    const emails: unknown[] = Array.from(emailsValue as readonly unknown[]);
    const validEmails = emails.filter(isGithubEmail);
    const verifiedEmails = validEmails.filter((entry) => entry.verified === true);
    const primaryEmail = verifiedEmails.find((entry) => entry.primary === true) ?? verifiedEmails[0];
    const email = primaryEmail?.email;

    if (!email) {
      throw new Error('GitHub verified email not available');
    }

    return {
      provider: 'github',
      providerUserId: String(userInfo.id),
      email,
      emailVerified: true,
      displayName: typeof userInfo.name === 'string' ? userInfo.name : '',
      avatarUrl: typeof userInfo.avatar_url === 'string' ? userInfo.avatar_url : '',
    };
  }
}

type GithubTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
};

type GithubUserInfo = {
  id: number | string;
  name?: string;
  avatar_url?: string;
};

type GithubEmail = {
  email: string;
  primary?: boolean;
  verified: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGithubTokenResponse(value: unknown): value is GithubTokenResponse {
  if (!isRecord(value) || typeof value['access_token'] !== 'string') return false;
  if (value['refresh_token'] !== undefined && typeof value['refresh_token'] !== 'string') return false;
  if (value['id_token'] !== undefined && typeof value['id_token'] !== 'string') return false;
  if (value['scope'] !== undefined && typeof value['scope'] !== 'string') return false;

  return true;
}

function isGithubUserInfo(value: unknown): value is GithubUserInfo {
  if (!isRecord(value)) return false;
  const id = value['id'];
  if (typeof id !== 'number' && typeof id !== 'string') return false;
  if (value['name'] !== undefined && typeof value['name'] !== 'string') return false;
  if (value['avatar_url'] !== undefined && typeof value['avatar_url'] !== 'string') return false;

  return true;
}

function isGithubEmail(value: unknown): value is GithubEmail {
  if (!isRecord(value) || typeof value['email'] !== 'string') return false;
  if (value['primary'] !== undefined && typeof value['primary'] !== 'boolean') return false;
  if (typeof value['verified'] !== 'boolean') return false;

  return true;
}
