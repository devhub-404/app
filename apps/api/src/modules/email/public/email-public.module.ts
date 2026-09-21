import { Module } from '@nestjs/common';
import { EmailInfrastructureModule } from '@/modules/email/infrastructure/mail.module';

@Module({
  imports: [EmailInfrastructureModule],
  exports: [EmailInfrastructureModule],
})
export class EmailPublicModule {}
