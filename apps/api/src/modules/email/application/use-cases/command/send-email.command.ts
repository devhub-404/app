import { Injectable } from '@nestjs/common';
import { EmailServicePort, type SendEmailOptions } from '../../../public/email.service.port';

@Injectable()
export class SendEmailCommand {
  constructor(private readonly email: EmailServicePort) {}
  execute(options: SendEmailOptions) {
    return this.email.send(options);
  }
}
