import { Injectable } from '@nestjs/common';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';

@Injectable()
export class RevokeOtherSessionsCommand {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(userId: string, exceptSessionId: string): Promise<void> {
    await this.sessionRepository.revokeOthersByUserId(userId, exceptSessionId);
  }
}
