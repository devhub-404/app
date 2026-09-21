import { Injectable } from '@nestjs/common';
import type { OAuthProvider, OAuthProviderName } from '@/modules/auth/domain/services/oauth-provider.service';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';
import { GoogleOAuthProvider } from '@/modules/auth/infrastructure/oauth/providers/google-oauth.provider';
import { GithubOAuthProvider } from '@/modules/auth/infrastructure/oauth/providers/github-oauth.provider';

@Injectable()
export class OAuthProviderFactoryService implements OAuthProviderFactory {
  private providers = new Map<OAuthProviderName, OAuthProvider>();

  constructor(
    readonly google: GoogleOAuthProvider,
    readonly github: GithubOAuthProvider,
  ) {
    this.providers.set(google.name, google);
    this.providers.set(github.name, github);
  }

  get(name: OAuthProviderName): OAuthProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`OAuth provider not found: ${name}`);
    }

    return provider;
  }

  list(): OAuthProviderName[] {
    return [...this.providers.keys()];
  }
}
