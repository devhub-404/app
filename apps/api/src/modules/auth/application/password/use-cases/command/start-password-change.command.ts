import { Injectable } from '@nestjs/common';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { VerifyPossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/verify-possession-proof.command';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { AppError } from '@/shared/errors/app-error';
import { StartPasswordChangeInputDTO, PasswordChangeStartResponseDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class StartPasswordChangeCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly verifyPossessionProofCommand: VerifyPossessionProofCommand,
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
  ) {}

  async execute(input: StartPasswordChangeInputDTO): Promise<PasswordChangeStartResponseDTO> {
    await this.verifyPossessionProofCommand.execute(input.userId, input.sessionId, {
      currentPassword: {
        serverLoginState: input.serverLoginState,
        finishLoginRequest: input.finishLoginRequest,
      },
      requireCurrentPassword: true,
      requiredAssurance: 'current',
    });

    // 2. Issue a short-lived password change token
    const changeToken = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.PASSWORD_CHANGE,
      purpose: 'password_change',
      payload: { sub: input.userId },
      expiresIn: '10m',
    });

    const credentialPassword = await this.credentialPasswordRepository.findByUserId(input.userId);
    if (!credentialPassword) throw new AppError('AUTH_INVALID_CREDENTIAL');

    const { registrationResponse } = await this.opaquePasswordService.createRegistrationResponse({
      userIdentifier: credentialPassword.opaqueUserIdentifier,
      registrationRequest: input.registrationRequest,
    });

    return { changeToken, registrationResponse };
  }
}
