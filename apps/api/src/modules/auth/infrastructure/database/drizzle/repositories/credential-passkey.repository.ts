import { Inject, Injectable } from '@nestjs/common';
import { and, eq, lt } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  CredentialPasskeyRepository,
  type PasskeyCredentialRow,
} from '@/modules/auth/application/passkeys/ports/credential-passkey.repository';
import type { PasskeyDeviceType } from '@/modules/auth/domain/services/passkey.service';
import { credentialPasskeySchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-passkey.schema';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

@Injectable()
export class DrizzleCredentialPasskeyRepository implements CredentialPasskeyRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async create(input: {
    credentialId: string;
    webauthnId: string;
    publicKey: string;
    counter: number;
    deviceType: PasskeyDeviceType;
    backedUp: boolean;
    transports: string[] | null;
    deviceName: string | null;
  }): Promise<void> {
    await this.db.insert(credentialPasskeySchema).values({
      id: input.credentialId,
      webauthnId: input.webauthnId,
      publicKey: input.publicKey,
      counter: input.counter,
      deviceType: input.deviceType,
      backedUp: input.backedUp,
      transports: input.transports,
      deviceName: input.deviceName,
    });
  }

  async updateCounter(id: string, counter: number): Promise<void> {
    await this.db
      .update(credentialPasskeySchema)
      .set({ counter })
      .where(and(eq(credentialPasskeySchema.id, id), lt(credentialPasskeySchema.counter, counter)));
  }

  async updateDeviceName(id: string, deviceName: string): Promise<void> {
    await this.db.update(credentialPasskeySchema).set({ deviceName }).where(eq(credentialPasskeySchema.id, id));
  }

  async findByWebauthnId(webauthnId: string): Promise<PasskeyCredentialRow | null> {
    const [row] = await this.db
      .select({
        credentialId: credentialSchema.id,
        userId: credentialSchema.userId,
        webauthnId: credentialPasskeySchema.webauthnId,
        publicKey: credentialPasskeySchema.publicKey,
        counter: credentialPasskeySchema.counter,
        deviceType: credentialPasskeySchema.deviceType,
        backedUp: credentialPasskeySchema.backedUp,
        transports: credentialPasskeySchema.transports,
        deviceName: credentialPasskeySchema.deviceName,
        createdAt: credentialSchema.createdAt,
        updatedAt: credentialSchema.updatedAt,
        lastUsedAt: credentialSchema.lastUsedAt,
      })
      .from(credentialPasskeySchema)
      .innerJoin(credentialSchema, eq(credentialSchema.id, credentialPasskeySchema.id))
      .where(eq(credentialPasskeySchema.webauthnId, webauthnId));

    return row ?? null;
  }

  async listByUserId(userId: string): Promise<PasskeyCredentialRow[]> {
    return await this.db
      .select({
        credentialId: credentialSchema.id,
        userId: credentialSchema.userId,
        webauthnId: credentialPasskeySchema.webauthnId,
        publicKey: credentialPasskeySchema.publicKey,
        counter: credentialPasskeySchema.counter,
        deviceType: credentialPasskeySchema.deviceType,
        backedUp: credentialPasskeySchema.backedUp,
        transports: credentialPasskeySchema.transports,
        deviceName: credentialPasskeySchema.deviceName,
        createdAt: credentialSchema.createdAt,
        updatedAt: credentialSchema.updatedAt,
        lastUsedAt: credentialSchema.lastUsedAt,
      })
      .from(credentialPasskeySchema)
      .innerJoin(credentialSchema, eq(credentialSchema.id, credentialPasskeySchema.id))
      .where(eq(credentialSchema.userId, userId));
  }

  async listWebauthnIdsByUserId(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ webauthnId: credentialPasskeySchema.webauthnId })
      .from(credentialPasskeySchema)
      .innerJoin(credentialSchema, eq(credentialSchema.id, credentialPasskeySchema.id))
      .where(eq(credentialSchema.userId, userId));

    return rows.map((row) => row.webauthnId);
  }
}
