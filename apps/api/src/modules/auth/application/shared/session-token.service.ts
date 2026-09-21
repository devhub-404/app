import { Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import {
  SessionRepository,
} from '@/modules/auth/application/sessions/ports/session.repository';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { Session } from '@/modules/auth/domain/entities/session';

import { nextSessionExpiry } from '@/modules/auth/application/sessions/session-policy';
import { CreateSessionWithTokensDTO } from '@/modules/auth/application/shared/dtos/internal/session-command.dto';

@Injectable()
export class SessionTokenService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly authSecretDigestService: AuthSecretDigestService,
  ) {}

  async createSessionWithTokens(input: CreateSessionWithTokensDTO): Promise<{ sessionSecret: string }> {
    const sessionSecret = randomBytes(32).toString('base64url');
    const sessionSecretHash = await this.authSecretDigestService.hash(sessionSecret);
    const lastProofOfPossessionAt = new Date();
    const session = Session.create(randomUUID(), {
      userId: input.userId,
      authMethod: input.authMethod,
      sessionSecretHash,
      lastProofOfPossessionAt,
      expiresAt: nextSessionExpiry(lastProofOfPossessionAt),
    });

    await this.sessionRepository.create({
      id: session.id,
      userId: input.userId,
      credentialId: input.credentialId ?? null,
      authMethod: input.authMethod,
      sessionSecretHash: session.sessionSecretHash,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      deviceName: input.deviceName ?? null,
      lastProofOfPossessionAt,
      expiresAt: session.expiresAt,
    });

    return { sessionSecret };
  }
}
