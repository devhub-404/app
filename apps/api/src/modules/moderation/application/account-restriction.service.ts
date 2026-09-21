import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountRestrictionPort } from '@/modules/moderation/application/ports/account-restriction.port';
import {
  MODERATION_ACCOUNT_RESTRICTION,
  type ModerationAccountRestrictionPort,
  type RestrictionCapability,
} from '@/modules/moderation/public/account-restriction.port';

@Injectable()
export class AccountRestrictionService implements ModerationAccountRestrictionPort {
  constructor(private readonly restrictions: AccountRestrictionPort) {}

  async assertAccountCapability(accountId: string, capability: RestrictionCapability): Promise<void> {
    const restriction = await this.restrictions.findEffective(accountId, capability, new Date().toISOString());
    if (restriction) throw new AppError('ACCOUNT_CAPABILITY_DENIED', { capability });
  }
}

export const ACCOUNT_RESTRICTION_SERVICE = MODERATION_ACCOUNT_RESTRICTION;
