import { Module } from '@nestjs/common';
import { AccountReadRepositoriesModule } from '../infrastructure/account-read-repositories.module';
import { AccountEligibilityPort } from './account-eligibility.port';
import { AccountEligibilityService } from './account-eligibility.service';

@Module({
  imports: [AccountReadRepositoriesModule],
  providers: [{ provide: AccountEligibilityPort, useClass: AccountEligibilityService }],
  exports: [AccountEligibilityPort],
})
export class AccountEligibilityModule {}
