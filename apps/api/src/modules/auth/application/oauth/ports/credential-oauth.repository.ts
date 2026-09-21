export type OAuthCredentialRow = {
  credentialId: string;
  userId: string;
  provider: 'github' | 'google';
  providerUserId: string;
};

export abstract class CredentialOAuthRepository {
  abstract create(input: {
    credentialId: string;
    provider: 'github' | 'google';
    providerUserId: string;
  }): Promise<void>;

  abstract findByProviderAndUserId(
    provider: 'github' | 'google',
    providerUserId: string,
  ): Promise<OAuthCredentialRow | null>;
}
