import { Inject, Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { AccountAccessPort } from '@/modules/auth/application/password/ports/user.repository';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { AppError } from '@/shared/errors/app-error';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { HandleAuthenticatedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-authenticated-login.command';
import { HandleFailedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-failed-login.command';
import { StartEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/start-email-verification.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import {
  CompletePasswordLoginInputDTO,
  CompletePasswordLoginResultDTO,
} from '@/modules/auth/application/password/dtos';

@Injectable()
export class CompletePasswordLoginCommand {
  constructor(
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly userRepository: AccountAccessPort,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    private readonly handleAuthenticatedUserCommand: HandleAuthenticatedLoginCommand,
    private readonly handleFailedAttemptCommand: HandleFailedLoginCommand,
    private readonly startEmailVerifyCommand: StartEmailVerificationCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: CompletePasswordLoginInputDTO): Promise<CompletePasswordLoginResultDTO> {
    // Finish the OPAQUE ceremony before branching on account existence/state.
    // Synthetic starts and wrong passwords both fail at this cryptographic
    // boundary, avoiding an early account-enumeration oracle on the complete
    // request. A successful finish proves possession of the credential that
    // was eligible at start; current Account state is still re-read below.
    try {
      await this.opaquePasswordService.finishLogin({
        serverLoginState: input.serverLoginState,
        finishLoginRequest: input.finishLoginRequest,
      });
    } catch {
      const failedUser = await this.userRepository.findByEmail(input.email);
      if (failedUser) await this.handleFailedAttemptCommand.execute(failedUser.userId);

      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new AppError('AUTH_INVALID_CREDENTIAL');

    const userRow = await this.accountService.getAuthenticationView(user.userId);
    if (!userRow) throw new AppError('AUTH_INVALID_CREDENTIAL');

    try {
      assertUserCanAuthenticate({
        id: userRow.userId,
        status: userRow.status,
        mfaEnabled: userRow.mfaEnabled,
        lockedUntil: userRow.lockedUntil,
      });
    } catch {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const credentialPassword = await this.credentialPasswordRepository.findByUserId(user.userId);
    if (!credentialPassword) throw new AppError('AUTH_INVALID_CREDENTIAL');

    await this.credentialPasswordRepository.resetFailedAttempts(credentialPassword.credentialId);

    if (userRow.deletedAt) {
      return await this.handleAuthenticatedUserCommand.execute({
        userId: user.userId,
        email: input.email,
        credentialId: credentialPassword.credentialId,
        authMethod: 'password',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceName: input.deviceName,
      });
    }

    if (!userRow.primaryEmailVerified) {
      await this.startEmailVerifyCommand.execute(user.userId);

      return { emailVerificationRequested: true };
    }

    return await this.handleAuthenticatedUserCommand.execute({
      userId: user.userId,
      email: input.email,
      credentialId: credentialPassword.credentialId,
      authMethod: 'password',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceName: input.deviceName,
    });
  }
}
