import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { MfaChallengeTokenDTO } from '@/modules/auth/application/shared/dto';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { MfaRecoveryCode } from '@/modules/auth/domain/entities/mfa-recovery-code';
import {
  VerifyRecoveryCodeInputDTO,
  VerifyRecoveryCodeResultDTO,
} from '@/modules/auth/application/mfa/dtos';

@Injectable()
export class VerifyRecoveryCodeCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly authSecretDigestService: AuthSecretDigestService,
    private readonly createSessionCommand: IssueSessionCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: VerifyRecoveryCodeInputDTO): Promise<VerifyRecoveryCodeResultDTO> {
    let tokenPayload: MfaChallengeTokenDTO;
    try {
      tokenPayload = await this.flowTokenService.verifySingleUse(MfaChallengeTokenDTO, input.token, 'mfa_challenge');
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const userRow = await this.accountService.getAuthenticationView(tokenPayload.sub);
    if (!userRow) throw new AppError('USER_NOT_FOUND');
    assertUserCanAuthenticate({
      id: userRow.userId,
      status: userRow.status,
      mfaEnabled: userRow.mfaEnabled,
      lockedUntil: userRow.lockedUntil,
    });

    const codeHash = await this.authSecretDigestService.hash(input.recoveryCode);
    const candidate = await this.mfaRecoveryCodeRepository.findUnusedByUserIdAndHash(tokenPayload.sub, codeHash);
    if (!candidate) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    MfaRecoveryCode.rehydrate(candidate).consume();

    const challengeConsumed = await this.flowTokenService.consumeSingleUse(tokenPayload, 'mfa_challenge');
    if (!challengeConsumed) throw new AppError('AUTH_TOKEN_INVALID');

    const recoveryCode = await this.mfaRecoveryCodeRepository.consumeUnusedByUserIdAndHash(tokenPayload.sub, codeHash);
    if (!recoveryCode) throw new AppError('AUTH_INVALID_CREDENTIAL');

    const remainingCodes = (await this.mfaRecoveryCodeRepository.listByUserId(tokenPayload.sub)).filter(
      (item) => item.usedAt === null,
    ).length;

    const { sessionSecret } = await this.createSessionCommand.execute({
      userId: tokenPayload.sub,
      credentialId: tokenPayload.credentialId ?? null,
      authMethod: tokenPayload.method,
      mfaVerified: true,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceName: input.deviceName,
    });

    return { sessionSecret, recoveryCodeUsed: true, remainingCodes };
  }
}
