import {
  RevokeAccountRestrictionInputDTO,
  RevokeAccountRestrictionOutputDTO,
} from '@/modules/moderation/application/dtos';
import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountRestrictionPort } from '@/modules/moderation/application/ports/account-restriction.port';
import { NotificationPublicService } from '@/modules/notification/public';

@Injectable()
export class RevokeAccountRestrictionCommand {
  constructor(
    private readonly restrictions: AccountRestrictionPort,
    private readonly notifications: NotificationPublicService,
  ) {}

  async execute(
    accountId: string,
    restrictionId: string,
    revokedByAccountId: string,
    input: RevokeAccountRestrictionInputDTO,
  ): Promise<RevokeAccountRestrictionOutputDTO> {
    const result = await this.restrictions.revoke({
      accountId,
      restrictionId,
      revokedByAccountId,
      reason: input.reason,
      revokedAt: new Date().toISOString(),
    });
    if (!result) throw new AppError('ACCOUNT_RESTRICTION_NOT_FOUND');
    await this.notifications.notify({
      accountId,
      type: 'restriction_revoked',
      sourceType: 'restriction',
      sourceId: restrictionId,
      targetType: 'account',
      targetId: accountId,
    });

    return result;
  }
}
