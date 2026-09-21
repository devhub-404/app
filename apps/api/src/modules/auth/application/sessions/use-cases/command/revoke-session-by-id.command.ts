import { Injectable } from '@nestjs/common';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';

@Injectable()
export class RevokeSessionByIdCommand {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findActiveAggregateById(userId, sessionId);
    if (!session) return;

    session.revoke();
    await this.sessionRepository.saveAggregate(session);
  }
}
