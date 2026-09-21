import type { OAuthProvider, OAuthProviderName } from '@/modules/auth/domain/services/oauth-provider.service';

export abstract class OAuthProviderFactory {
  abstract get(name: OAuthProviderName): OAuthProvider;
  abstract list(): OAuthProviderName[];
}
