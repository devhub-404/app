import { Module } from '@nestjs/common';
import { AccountReadRepositoriesModule } from '../infrastructure/account-read-repositories.module';
import { AccountProfileReadPort } from './account-profile-read.port';
import { AccountProfileReadService } from './account-profile-read.service';

@Module({
  imports: [AccountReadRepositoriesModule],
  providers: [{ provide: AccountProfileReadPort, useClass: AccountProfileReadService }],
  exports: [AccountProfileReadPort],
})
export class AccountProfileReadModule {}
