import { Injectable } from '@nestjs/common';
import { SessionQueryRepository } from '@/modules/auth/application/sessions/ports/session.query.repository';
import { SessionListDTO } from '@/modules/auth/application/sessions/dtos/out';

@Injectable()
export class ListMySessionsQuery {
  constructor(private readonly sessionQueryRepository: SessionQueryRepository) {}

  async execute(userId: string): Promise<SessionListDTO> {
    const items = await this.sessionQueryRepository.findActiveByUserId(userId);

    return { items };
  }
}
