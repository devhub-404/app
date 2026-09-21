import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { SubmitContactMessageInputDTO } from '@/modules/contact/application/dtos/in';
import { SubmitContactMessageOutputDTO } from '@/modules/contact/application/dtos/out';
import { SubmitContactMessageCommand } from '@/modules/contact/application/use-cases/submit-contact-message.command';
import { Public } from '@/shared/nest/decorators/public';

@Controller('contact')
@Public()
@UseGuards(LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.contact })
export class ContactController {
  constructor(private readonly submitContactMessage: SubmitContactMessageCommand) {}

  @Version('1')
  @Post()
  @AppResponse('CONTACT_MESSAGE_SUBMITTED', SubmitContactMessageOutputDTO)
  submit(@Body() input: SubmitContactMessageInputDTO): Promise<SubmitContactMessageOutputDTO> {
    return this.submitContactMessage.execute(input);
  }
}
