import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  CredentialOAuthQueryRepository,
  type CredentialOAuthRow,
} from '@/modules/auth/application/oauth/ports/credential-oauth.query.repository';
import { credentialOAuthSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-oauth.schema';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

@Injectable()
export class DrizzleCredentialOAuthQueryRepository implements CredentialOAuthQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findByProviderAndUserId(
    provider: 'github' | 'google',
    providerUserId: string,
  ): Promise<CredentialOAuthRow | null> {
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

  async listByUserId(userId: string): Promise<CredentialOAuthRow[]> {
    return await this.db
      .select({
        credentialId: credentialSchema.id,
        userId: credentialSchema.userId,
        provider: credentialOAuthSchema.provider,
        providerUserId: credentialOAuthSchema.providerUserId,
      })
      .from(credentialOAuthSchema)
      .innerJoin(credentialSchema, eq(credentialSchema.id, credentialOAuthSchema.id))
      .where(eq(credentialSchema.userId, userId));
  }
}
