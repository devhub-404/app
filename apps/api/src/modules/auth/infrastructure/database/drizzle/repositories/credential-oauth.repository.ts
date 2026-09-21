import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  CredentialOAuthRepository,
  type OAuthCredentialRow,
} from '@/modules/auth/application/oauth/ports/credential-oauth.repository';
import { credentialOAuthSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-oauth.schema';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

@Injectable()
export class DrizzleCredentialOAuthRepository implements CredentialOAuthRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async create(input: { credentialId: string; provider: 'github' | 'google'; providerUserId: string }): Promise<void> {
    await this.db.insert(credentialOAuthSchema).values({
      id: input.credentialId,
      provider: input.provider,
      providerUserId: input.providerUserId,
    });
  }

  async findByProviderAndUserId(
    provider: 'github' | 'google',
    providerUserId: string,
  ): Promise<OAuthCredentialRow | null> {
    const [row] = await this.db
      .select({
        credentialId: credentialSchema.id,
        userId: credentialSchema.userId,
        provider: credentialOAuthSchema.provider,
        providerUserId: credentialOAuthSchema.providerUserId,
      })
      .from(credentialOAuthSchema)
      .innerJoin(credentialSchema, eq(credentialSchema.id, credentialOAuthSchema.id))
      .where(
        and(eq(credentialOAuthSchema.provider, provider), eq(credentialOAuthSchema.providerUserId, providerUserId)),
      );

    return row ?? null;
  }
}
