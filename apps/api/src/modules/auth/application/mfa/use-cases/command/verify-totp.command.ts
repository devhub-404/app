import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { MfaChallengeTokenDTO } from '@/modules/auth/application/shared/dto';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { VerifyTotpInputDTO, VerifyTotpResultDTO } from '@/modules/auth/application/mfa/dtos';

@Injectable()
export class VerifyTotpCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly totpService: TotpService,
    private readonly totpSecretCryptoService: TotpSecretCryptoService,
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly createSessionCommand: IssueSessionCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: VerifyTotpInputDTO): Promise<VerifyTotpResultDTO> {
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

    const totp = await this.mfaTotpRepository.findByUserId(tokenPayload.sub);
    if (!totp || totp.status !== 'active') {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const secret = await this.totpSecretCryptoService.decryptBase32Secret(totp.encryptedSecret);
    const valid = this.totpService.verifyToken({ token: input.code, secret, window: 1 });
    if (!valid) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const consumed = await this.flowTokenService.consumeSingleUse(tokenPayload, 'mfa_challenge');
    if (!consumed) throw new AppError('AUTH_TOKEN_INVALID');

    const { sessionSecret } = await this.createSessionCommand.execute({
      userId: tokenPayload.sub,
      credentialId: tokenPayload.credentialId ?? null,
      authMethod: tokenPayload.method,
      mfaVerified: true,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceName: input.deviceName,
    });

    return { sessionSecret };
  }
}
