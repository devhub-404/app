import { Injectable } from '@nestjs/common';
import { SessionQueryRepository } from '@/modules/auth/application/sessions/ports/session.query.repository';
import { SessionDTO } from '@/modules/auth/application/sessions/dtos/out';

@Injectable()
export class GetCurrentSessionQuery {
  constructor(private readonly sessionQueryRepository: SessionQueryRepository) {}

  async execute(userId: string, sessionId: string): Promise<SessionDTO | null> {
    return await this.sessionQueryRepository.findActiveById(userId, sessionId);
  }
}
