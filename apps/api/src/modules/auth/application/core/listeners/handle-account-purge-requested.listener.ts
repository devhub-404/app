import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_PURGE_REQUESTED_EVENT, type AccountPurgeRequestedEvent } from '@/modules/account/public/events';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AuthFlowProofRepository } from '@/modules/auth/application/shared/ports/auth-flow-proof.repository';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';

@Injectable()
export class HandleAuthAccountPurgeRequestedListener {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly credentials: CredentialRepository,
    private readonly totp: MfaTotpRepository,
    private readonly recoveryCodes: MfaRecoveryCodeRepository,
    private readonly proofs: AuthFlowProofRepository,
  ) {}

  @OnEvent(ACCOUNT_PURGE_REQUESTED_EVENT)
  async handle(event: AccountPurgeRequestedEvent): Promise<void> {
    await this.sessions.deleteByUserId(event.userId);
    await this.totp.deleteByUserId(event.userId);
    await this.recoveryCodes.deleteByUserId(event.userId);
    await this.credentials.deleteByUserId(event.userId);
    await this.proofs.deleteBySubjectId(event.userId);
  }
}
