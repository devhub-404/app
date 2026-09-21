import { Injectable } from '@nestjs/common';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';

@Injectable()
export class RevokeAllSessionsCommand {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(userId: string): Promise<void> {
    await this.sessionRepository.revokeByUserId(userId);
  }
}
