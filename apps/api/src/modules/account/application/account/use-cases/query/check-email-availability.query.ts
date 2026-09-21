import { Injectable } from '@nestjs/common';
import { EmailAvailabilityQueryRepository } from '@/modules/account/application/account/ports/email-availability.query.repository';

@Injectable()
export class CheckEmailAvailabilityQuery {
  constructor(private readonly repository: EmailAvailabilityQueryRepository) {}

  execute(email: string): Promise<boolean> {
    return this.repository.isEmailAvailable(email);
  }
}
