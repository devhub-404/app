import { Module } from '@nestjs/common';
import { AccountModule } from '../account.module';
import { AccountProfileReadModule } from './account-profile-read.module';

@Module({
  imports: [AccountModule, AccountProfileReadModule],
  exports: [AccountModule, AccountProfileReadModule],
})
export class AccountPublicModule {}
