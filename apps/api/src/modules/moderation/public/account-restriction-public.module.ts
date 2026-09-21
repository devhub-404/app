import { Module } from '@nestjs/common';
import { AccountRestrictionPort } from '../application/ports/account-restriction.port';
import { AccountRestrictionService } from '../application/account-restriction.service';
import { DrizzleAccountRestrictionRepository } from '../infrastructure/repositories/account-restriction.repository';
import { ModerationAccountRestrictionPort } from './account-restriction.port';

/**
 * Narrow runtime boundary for capabilities that only need account restrictions.
 * It deliberately does not import the moderation HTTP/presentation module.
 */
@Module({
  providers: [
    { provide: AccountRestrictionPort, useClass: DrizzleAccountRestrictionRepository },
    AccountRestrictionService,
    { provide: ModerationAccountRestrictionPort, useExisting: AccountRestrictionService },
  ],
  exports: [AccountRestrictionPort, AccountRestrictionService, ModerationAccountRestrictionPort],
})
export class AccountRestrictionPublicModule {}
