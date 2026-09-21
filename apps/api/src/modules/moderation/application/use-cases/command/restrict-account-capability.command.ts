import {
  RestrictAccountCapabilityInputDTO,
  RestrictAccountCapabilityOutputDTO,
} from '@/modules/moderation/application/dtos';
import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountRestrictionPort } from '@/modules/moderation/application/ports/account-restriction.port';
import { NotificationPublicService } from '@/modules/notification/public';

@Injectable()
export class RestrictAccountCapabilityCommand {
  constructor(
    private readonly restrictions: AccountRestrictionPort,
    private readonly notifications: NotificationPublicService,
  ) {}

  async execute(
    accountId: string,
    appliedByAccountId: string,
    input: RestrictAccountCapabilityInputDTO,
  ): Promise<RestrictAccountCapabilityOutputDTO> {
    const existing = await this.restrictions.findEffective(accountId, input.capability, new Date().toISOString());
    if (existing) throw new AppError('ACCOUNT_RESTRICTION_ALREADY_ACTIVE');

    const restriction = await this.restrictions.create({
      accountId,
      appliedByAccountId,
      capability: input.capability,
      reason: input.reason,
      startsAt: input.startsAt,
      endsAt: input.endsAt ?? null,
    });
    await this.notifications.notify({
      accountId,
      type: 'restriction_applied',
      sourceType: 'restriction',
      sourceId: restriction.id,
      targetType: 'account',
      targetId: accountId,
    });

    return restriction;
  }
}
