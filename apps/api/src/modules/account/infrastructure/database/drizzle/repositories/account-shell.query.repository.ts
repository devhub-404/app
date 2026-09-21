import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountProfileSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';
import { accountPreferencesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-preferences.schema';
import { accountRolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-role.schema';
import { rolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';
import { mediaObjectsSchema } from '@/shared/infrastructure/database/drizzle/schema/media/media-objects.schema';
import { deriveAccountStatus } from '@/modules/account/public/account-access.ports';
import { resolvePublicMediaUrl } from '@/shared/infrastructure/media/media-url';
import { AccountShellQueryRepository } from '@/modules/account/application/account/ports/account-shell.query.repository';
import type { AccountShellDTO } from '@/modules/account/application/account/dtos/out/account-shell.dto';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';

@Injectable()
export class DrizzleAccountShellQueryRepository implements AccountShellQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    @Inject(MEDIA_CONFIG) private readonly mediaConfig: MediaConfig,
  ) {}

  async findByUserId(userId: string): Promise<AccountShellDTO | null> {
    const [row] = await this.db
      .select({
        accountId: accountsSchema.id,
        voluntaryStatus: accountsSchema.voluntaryStatus,
        moderationStatus: accountsSchema.moderationStatus,
        deletionStatus: accountsSchema.deletionStatus,
        username: accountProfileSchema.username,
        displayName: accountProfileSchema.displayName,
        avatarObjectKey: mediaObjectsSchema.objectKey,
        locale: accountPreferencesSchema.locale,
        role: rolesSchema.name,
      })
      .from(accountsSchema)
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, accountsSchema.id))
      .innerJoin(accountPreferencesSchema, eq(accountPreferencesSchema.userId, accountsSchema.id))
      .leftJoin(accountRolesSchema, eq(accountRolesSchema.userId, accountsSchema.id))
      .leftJoin(rolesSchema, eq(rolesSchema.id, accountRolesSchema.roleId))
      .leftJoin(
        mediaObjectsSchema,
        and(eq(mediaObjectsSchema.id, accountProfileSchema.avatarMediaId), eq(mediaObjectsSchema.status, 'confirmed')),
      )
      .where(eq(accountsSchema.id, userId))
      .limit(1);

    if (!row) return null;

    return {
      account: { id: row.accountId, status: deriveAccountStatus(row) },
      profile: row.username
        ? {
            username: row.username,
            displayName: row.displayName,
            avatarUrl: resolvePublicMediaUrl(row.avatarObjectKey, this.mediaConfig),
          }
        : null,
      preferences: { locale: row.locale as 'pt' | 'en' | 'es' | null },
      role: row.role,
    };
  }
}
