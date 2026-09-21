import { Inject, Injectable } from '@nestjs/common';
import { SessionAccessValidationPort } from '@/modules/auth/public/session-access-validation.port';
import { SessionAuthenticationQueryRepository } from '@/modules/auth/application/sessions/ports/session-authentication.query.repository';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { resolveEffectiveSessionRole } from '@/modules/auth/application/shared/session-roles';
import type { AuthenticatedPrincipal } from '@/shared/nest/auth';

@Injectable()
export class SessionAccessValidationService implements SessionAccessValidationPort {
  constructor(
    @Inject(SessionAuthenticationQueryRepository)
    private readonly sessionAuthenticationQuery: SessionAuthenticationQueryRepository,
    @Inject(AuthSecretDigestService) private readonly authSecretDigestService: AuthSecretDigestService,
  ) {}

  async resolve(sessionSecret: string): Promise<AuthenticatedPrincipal | null> {
    const sessionSecretHash = await this.authSecretDigestService.hash(sessionSecret);
    const row = await this.sessionAuthenticationQuery.findActiveBySecretHash(sessionSecretHash);
    if (!row) return null;

    return {
      sub: row.userId,
      sid: row.sessionId,
      type: 'session',
      role: resolveEffectiveSessionRole(row.role, row.mfaEnabled),
    };
  }
}
