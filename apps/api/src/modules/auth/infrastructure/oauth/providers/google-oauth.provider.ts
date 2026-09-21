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
export class GoogleOAuthProvider implements OAuthProvider {
  readonly name = 'google' as const;

  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userinfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
  constructor(@Inject(AUTH_CONFIG) config: AuthConfig) {
    this.clientId = config.oauth.google.clientId;
    this.clientSecret = config.oauth.google.clientSecret;
  }

  private readonly clientId: string;
  private readonly clientSecret: string;

  getAuthorizationUrl(options: OAuthAuthorizationOptions): string {
    const scope = options.scope?.join(' ') || 'openid email profile';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: options.redirectUri,
      response_type: 'code',
      scope,
      code_challenge: options.codeChallenge,
      code_challenge_method: options.codeChallengeMethod ?? 'S256',
      state: options.state,
      access_type: options.accessType || 'offline',
      prompt: options.prompt || 'select_account',
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) throw new Error(`Google token error: ${await res.text()}`);

    const data = (await res.json()) as unknown;
    if (!isGoogleTokenResponse(data)) {
      throw new Error('Google token response is invalid');
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
    const res = await fetch(this.userinfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Google userinfo error: ${res.status}`);

    const data = (await res.json()) as unknown;
    if (!isGoogleUserInfo(data)) {
      throw new Error('Google userinfo response is invalid');
    }
    if (data.email_verified !== true) {
      throw new Error('Google email is not verified');
    }

    return {
      provider: 'google',
      providerUserId: data.sub,
      email: data.email,
      emailVerified: true,
      displayName: data.name ?? '',
      avatarUrl: data.picture ?? '',
    };
  }
}

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGoogleTokenResponse(value: unknown): value is GoogleTokenResponse {
  if (!isRecord(value) || typeof value['access_token'] !== 'string') return false;
  if (value['refresh_token'] !== undefined && typeof value['refresh_token'] !== 'string') return false;
  if (value['id_token'] !== undefined && typeof value['id_token'] !== 'string') return false;
  if (value['scope'] !== undefined && typeof value['scope'] !== 'string') return false;

  return true;
}

function isGoogleUserInfo(value: unknown): value is GoogleUserInfo {
  if (!isRecord(value)) return false;
  if (typeof value['sub'] !== 'string') return false;
  if (typeof value['email'] !== 'string') return false;
  if (typeof value['email_verified'] !== 'boolean') return false;
  if (value['name'] !== undefined && typeof value['name'] !== 'string') return false;
  if (value['picture'] !== undefined && typeof value['picture'] !== 'string') return false;

  return true;
}
