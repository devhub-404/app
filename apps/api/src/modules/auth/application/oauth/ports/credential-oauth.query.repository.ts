export type CredentialOAuthRow = {
  credentialId: string;
  userId: string;
  provider: 'github' | 'google';
  providerUserId: string;
};

export abstract class CredentialOAuthQueryRepository {
  abstract findByProviderAndUserId(
    provider: 'github' | 'google',
    providerUserId: string,
  ): Promise<CredentialOAuthRow | null>;

  abstract listByUserId(userId: string): Promise<CredentialOAuthRow[]>;
}
