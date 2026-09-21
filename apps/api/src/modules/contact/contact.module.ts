import { Module } from '@nestjs/common';
import { SubmitContactMessageCommand } from '@/modules/contact/application/use-cases/submit-contact-message.command';
import { ContactController } from '@/modules/contact/presentation/contact.controller';
import { EmailPublicModule } from '@/modules/email/public/email-public.module';

@Module({
  imports: [EmailPublicModule],
  controllers: [ContactController],
  providers: [SubmitContactMessageCommand],
})
export class ContactModule {}
