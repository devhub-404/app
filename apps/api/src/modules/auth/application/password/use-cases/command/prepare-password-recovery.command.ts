import { Inject, Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { PasswordResetTokenDTO } from '@/modules/auth/application/shared/dto';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { AppError } from '@/shared/errors/app-error';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import {
  PreparePasswordRecoveryInputDTO,
  PasswordRecoverPrepareResponseDTO,
} from '@/modules/auth/application/password/dtos';

@Injectable()
export class PreparePasswordRecoveryCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    @Inject(ACCOUNT_SERVICE) private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: PreparePasswordRecoveryInputDTO): Promise<PasswordRecoverPrepareResponseDTO> {
    const payload = await this.flowTokenService.verifySingleUse(PasswordResetTokenDTO, input.token, 'password_reset');
    const user = await this.accountService.getAuthenticationView(payload.sub);
    if (!user) throw new AppError('USER_NOT_FOUND');
    assertUserCanAuthenticate({
      id: user.userId,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      lockedUntil: user.lockedUntil,
    });
    const credential = await this.credentialPasswordRepository.findByUserId(payload.sub);
    if (!credential) throw new AppError('AUTH_INVALID_CREDENTIAL');

    return this.opaquePasswordService.createRegistrationResponse({
      userIdentifier: credential.opaqueUserIdentifier,
      registrationRequest: input.registrationRequest,
    });
  }
}
