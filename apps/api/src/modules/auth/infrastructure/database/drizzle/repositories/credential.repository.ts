import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { DrizzleUnitOfWork, type DrizzleTransaction } from '@/shared/infrastructure/database/drizzle/unit-of-work';
import {
  type CredentialOwnershipRow,
  CredentialRepository,
} from '@/modules/auth/application/shared/ports/credential.repository';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';
import { credentialPasswordSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-password.schema';
import { credentialOAuthSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-oauth.schema';
import { credentialPasskeySchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-passkey.schema';

@Injectable()
export class DrizzleCredentialRepository implements CredentialRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly unitOfWork: DrizzleUnitOfWork,
  ) {}

  async create(input: { userId: string; type: 'password' | 'oauth' | 'passkey' }): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(credentialSchema)
      .values({
        userId: input.userId,
        type: input.type,
      })
      .returning({ id: credentialSchema.id });

    if (!row) throw new Error('CREDENTIAL_CREATE_FAILED');

    return row;
  }

  async createPassword(input: {
    userId: string;
    verifier: string;
    opaqueUserIdentifier: string;
  }): Promise<{ id: string }> {
    const active = this.unitOfWork.current;
    if (active) return this.createPasswordIn(active, input);

    return this.db.$primary.transaction(async (tx) => this.createPasswordIn(tx, input));
  }

  private async createPasswordIn(
    tx: DrizzleTransaction,
    input: { userId: string; verifier: string; opaqueUserIdentifier: string },
  ): Promise<{ id: string }> {
    const [credential] = await tx
      .insert(credentialSchema)
      .values({ userId: input.userId, type: 'password' })
      .returning({ id: credentialSchema.id });
    if (!credential) throw new Error('CREDENTIAL_CREATE_FAILED');

    await tx.insert(credentialPasswordSchema).values({
      id: credential.id,
      verifier: input.verifier,
      opaqueUserIdentifier: input.opaqueUserIdentifier,
    });

    return credential;
  }

  async createOAuth(input: {
    userId: string;
    provider: 'github' | 'google';
    providerUserId: string;
  }): Promise<{ id: string }> {
    const active = this.unitOfWork.current;
    if (active) return this.createOAuthIn(active, input);

    return this.db.$primary.transaction(async (tx) => this.createOAuthIn(tx, input));
  }

  private async createOAuthIn(
    tx: DrizzleTransaction,
    input: { userId: string; provider: 'github' | 'google'; providerUserId: string },
  ): Promise<{ id: string }> {
    const [credential] = await tx
      .insert(credentialSchema)
      .values({ userId: input.userId, type: 'oauth' })
      .returning({ id: credentialSchema.id });
    if (!credential) throw new Error('CREDENTIAL_CREATE_FAILED');

    await tx.insert(credentialOAuthSchema).values({
      id: credential.id,
      provider: input.provider,
      providerUserId: input.providerUserId,
    });

    return credential;
  }

  async createPasskey(input: {
    userId: string;
    webauthnId: string;
    publicKey: string;
    counter: number;
    deviceType: 'single_device' | 'multi_device';
    backedUp: boolean;
    transports: string[] | null;
    deviceName: string | null;
  }): Promise<{ id: string }> {
    return this.db.transaction(async (tx) => {
      const [credential] = await tx
        .insert(credentialSchema)
        .values({ userId: input.userId, type: 'passkey' })
        .returning({ id: credentialSchema.id });
      if (!credential) throw new Error('CREDENTIAL_CREATE_FAILED');

      await tx.insert(credentialPasskeySchema).values({
        id: credential.id,
        webauthnId: input.webauthnId,
        publicKey: input.publicKey,
        counter: input.counter,
        deviceType: input.deviceType,
        backedUp: input.backedUp,
        transports: input.transports,
        deviceName: input.deviceName,
      });

      return credential;
    });
  }

  async updateLastUsedAt(id: string): Promise<void> {
    await this.db.update(credentialSchema).set({ lastUsedAt: new Date() }).where(eq(credentialSchema.id, id));
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(credentialSchema).where(eq(credentialSchema.id, id));
  }

  async findById(id: string): Promise<CredentialOwnershipRow | null> {
    const [row] = await this.db
      .select({
        id: credentialSchema.id,
        userId: credentialSchema.userId,
        type: credentialSchema.type,
      })
      .from(credentialSchema)
      .where(eq(credentialSchema.id, id));

    return row ?? null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(credentialSchema).where(eq(credentialSchema.userId, userId));
  }

  async countByUserId(userId: string): Promise<number> {
    const rows = await this.db
      .select({ id: credentialSchema.id })
      .from(credentialSchema)
      .where(eq(credentialSchema.userId, userId));

    return rows.length;
  }
}
