import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { AccountAccessPort, AccountEmailAccessPort } from '@/modules/account/public';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';
import { credentialPasswordSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-password.schema';
import { credentialOAuthSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-oauth.schema';
import { credentialPasskeySchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-passkey.schema';
import { mfaTotpSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-totp.schema';
import { mfaRecoveryCodeSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-recovery-code.schema';
import { sessionsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/sessions.schema';
import type { PasskeyDeviceType } from '@/modules/auth/domain/services/passkey.service';
import type { UserMeDTO } from '@/modules/auth/application/auth/dtos/out/user-me.dto';
import { UserMeQueryRepository } from '@/modules/auth/application/auth/ports/user-me.query.repository';

type PasswordRow = {
  id: string;
  scheme: string;
  failedAttempts: number;
  lockedUntil: Date | null;
};

type OAuthRow = {
  id: string;
  provider: 'github' | 'google';
  providerUserId: string;
};

type PasskeyRow = {
  id: string;
  webauthnId: string;
  deviceType: PasskeyDeviceType;
  backedUp: boolean;
  transports: string[] | null;
  deviceName: string | null;
  counter: number;
};

@Injectable()
export class DrizzleUserMeQueryRepository implements UserMeQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly accountAccess: AccountAccessPort,
    private readonly accountEmails: AccountEmailAccessPort,
  ) {}

  async findByUserIdAndSessionId(userId: string, sessionId: string): Promise<UserMeDTO | null> {
    const user = await this.accountAccess.findById(userId);

    if (!user) {
      return null;
    }

    const [emails, credentials, totp, recoveryCodes, session] = await Promise.all([
      this.accountEmails.listByUserId(userId),

      this.db
        .select({
          id: credentialSchema.id,
          type: credentialSchema.type,
          createdAt: credentialSchema.createdAt,
          updatedAt: credentialSchema.updatedAt,
          lastUsedAt: credentialSchema.lastUsedAt,
        })
        .from(credentialSchema)
        .where(eq(credentialSchema.userId, userId))
        .orderBy(desc(credentialSchema.createdAt)),

      this.db
        .select({
          id: mfaTotpSchema.id,
          status: mfaTotpSchema.status,
        })
        .from(mfaTotpSchema)
        .where(eq(mfaTotpSchema.userId, userId))
        .limit(1)
        .then((rows) => rows[0] ?? null),

      this.db
        .select({
          id: mfaRecoveryCodeSchema.id,
          usedAt: mfaRecoveryCodeSchema.usedAt,
        })
        .from(mfaRecoveryCodeSchema)
        .where(eq(mfaRecoveryCodeSchema.userId, userId)),

      this.db
        .select({
          id: sessionsSchema.id,
          authMethod: sessionsSchema.authMethod,
          lastProofOfPossessionAt: sessionsSchema.lastProofOfPossessionAt,
          createdAt: sessionsSchema.createdAt,
          expiresAt: sessionsSchema.expiresAt,
          revokedAt: sessionsSchema.revokedAt,
          ipAddress: sessionsSchema.ipAddress,
          userAgent: sessionsSchema.userAgent,
          deviceName: sessionsSchema.deviceName,
        })
        .from(sessionsSchema)
        .where(
          and(
            eq(sessionsSchema.userId, userId),
            eq(sessionsSchema.id, sessionId),
            isNull(sessionsSchema.revokedAt),
            gt(sessionsSchema.expiresAt, new Date()),
          ),
        )
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

    const credentialIds = credentials.map((credential) => credential.id);

    const [passwordRows, oauthRows, passkeyRows] = await Promise.all([
      credentialIds.length
        ? this.db
            .select({
              id: credentialPasswordSchema.id,
              scheme: credentialPasswordSchema.scheme,
              failedAttempts: credentialPasswordSchema.failedAttempts,
              lockedUntil: credentialPasswordSchema.lockedUntil,
            })
            .from(credentialPasswordSchema)
            .where(inArray(credentialPasswordSchema.id, credentialIds))
        : Promise.resolve([] as PasswordRow[]),
      credentialIds.length
        ? this.db
            .select({
              id: credentialOAuthSchema.id,
              provider: credentialOAuthSchema.provider,
              providerUserId: credentialOAuthSchema.providerUserId,
            })
            .from(credentialOAuthSchema)
            .where(inArray(credentialOAuthSchema.id, credentialIds))
        : Promise.resolve([] as OAuthRow[]),
      credentialIds.length
        ? this.db
            .select({
              id: credentialPasskeySchema.id,
              webauthnId: credentialPasskeySchema.webauthnId,
              deviceType: credentialPasskeySchema.deviceType,
              backedUp: credentialPasskeySchema.backedUp,
              transports: credentialPasskeySchema.transports,
              deviceName: credentialPasskeySchema.deviceName,
              counter: credentialPasskeySchema.counter,
            })
            .from(credentialPasskeySchema)
            .where(inArray(credentialPasskeySchema.id, credentialIds))
        : Promise.resolve([] as PasskeyRow[]),
    ]);

    return {
      user,
      emails,
      credentials: credentials.map((credential) => {
        const password = passwordRows.find((row) => row.id === credential.id);
        const oauth = oauthRows.find((row) => row.id === credential.id);
        const passkey = passkeyRows.find((row) => row.id === credential.id);

        return {
          ...credential,
          details: password
            ? {
                type: 'password' as const,
                scheme: password.scheme,
                failedAttempts: password.failedAttempts,
                lockedUntil: password.lockedUntil,
              }
            : oauth
              ? {
                  type: 'oauth' as const,
                  provider: oauth.provider,
                  providerUserId: oauth.providerUserId,
                }
              : passkey
                ? {
                    type: 'passkey' as const,
                    webauthnId: passkey.webauthnId,
                    deviceType: passkey.deviceType,
                    backedUp: passkey.backedUp,
                    transports: passkey.transports,
                    deviceName: passkey.deviceName ?? null,
                    counter: passkey.counter,
                  }
                : null,
        };
      }),
      mfa: {
        enabled: user.mfaEnabled,
        totp: {
          enrolled: totp !== null,
          status: totp ? totp.status : null,
        },
        recoveryCodesRemaining: recoveryCodes.filter((code) => !code.usedAt).length,
      },
      session,
    };
  }
}
