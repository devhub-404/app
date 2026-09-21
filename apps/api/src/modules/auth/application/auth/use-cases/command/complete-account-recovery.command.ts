import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { AccountRecoveryTokenDTO } from '@/modules/auth/application/shared/dto';
import { AccountAccessPort, AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';
import { AccountRecoveredDTO } from '@/modules/auth/application/auth/dtos/out';
import { CompleteAccountRecoveryInputDTO } from '@/modules/auth/application/auth/dtos/in';

@Injectable()
export class CompleteAccountRecoveryCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly userRepository: AccountAccessPort,
    private readonly userEmailRepository: AccountEmailAccessPort,
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand,
  ) {}

  async execute(input: CompleteAccountRecoveryInputDTO): Promise<AccountRecoveredDTO> {
    let payload: AccountRecoveryTokenDTO;
    try {
      payload = await this.flowTokenService.verifySingleUse(AccountRecoveryTokenDTO, input.token, 'account_recovery');
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const userRow = await this.userRepository.findById(payload.sub);
    if (!userRow) {
      throw new AppError('USER_NOT_FOUND');
    }
    if (userRow.status === 'banned') {
      throw new AppError('USER_CANNOT_AUTHENTICATE');
    }

    const backupEmail = await this.userEmailRepository.findByEmail(payload.email);
    if (
      !backupEmail ||
      backupEmail.userId !== payload.sub ||
      backupEmail.type !== 'backup' ||
      !backupEmail.verifiedAt
    ) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    // A recovery proof is not an email-change proof. In particular, control of
    // a verified backup address must never promote an arbitrary address to a
    // verified primary. Recovery may disable MFA; assigned roles remain on the
    // Account, but Auth will not place privileged roles in a non-MFA Session.

    // Account recovery restores access to the Account and resets MFA state.
    // Password replacement has its own OPAQUE password-recovery ceremony.

    // Account is the authority for whether MFA is currently required. Flip that
    // projection before purging Auth-owned factors so a transient cleanup
    // failure cannot leave the Account requiring a factor that no longer exists.
    const mfaUpdated = await this.userRepository.setMfaEnabled(payload.sub, false);
    if (!mfaUpdated) throw new AppError('USER_NOT_FOUND');
    await this.userRepository.setLockedUntil(payload.sub, null);

    // Revocation is authoritative for the cookie-backed sessions. Any request
    // made with one of them is rejected as soon as the session is revoked.
    await this.revokeAllSessionsCommand.execute(payload.sub);

    // Factor cleanup is idempotent and may be retried safely after the Account
    // projection and Session revocation have converged.
    await this.mfaTotpRepository.deleteByUserId(payload.sub);
    await this.mfaRecoveryCodeRepository.deleteByUserId(payload.sub);

    // Consume only after all recovery effects have converged. Everything above
    // is idempotent, so concurrent attempts are harmless while this atomic
    // consume guarantees that at most one attempt can complete successfully.
    // A transient failure before this point leaves the proof retryable instead
    // of stranding the Account in a partially recovered state.
    if (!(await this.flowTokenService.consumeSingleUse(payload, 'account_recovery'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    return { recovered: true };
  }
}
