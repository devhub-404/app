import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RestoreAccessEmailService } from '@/modules/auth/application/auth/application-services/restore-access-email.service';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { MfaChallengeService } from '@/modules/auth/application/mfa/application-services/mfa-challenge.service';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import {
  HandleAuthenticatedLoginInputDTO,
  HandleAuthenticatedLoginResultDTO,
} from '@/modules/auth/application/auth/dtos';

@Injectable()
export class HandleAuthenticatedLoginCommand {
  constructor(
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    private readonly createSessionCommand: IssueSessionCommand,
    private readonly createMfaChallengeCommand: MfaChallengeService,
    private readonly sendRestoreAccessEmailCommand: RestoreAccessEmailService,
    private readonly flowTokenService: FlowTokenService,
  ) {}

  async execute(
    input: HandleAuthenticatedLoginInputDTO,
  ): Promise<HandleAuthenticatedLoginResultDTO> {
    const userRow = await this.accountService.getAuthenticationView(input.userId);
    if (!userRow) throw new AppError('USER_NOT_FOUND');

    if (userRow.deletedAt) {
      await this.sendRestoreAccessEmailCommand.execute({ userId: input.userId, email: input.email });

      return { restoreAccessRequested: true };
    }

    const user = assertUserCanAuthenticate({
      id: userRow.userId,
      status: userRow.status,
      mfaEnabled: userRow.mfaEnabled,
      lockedUntil: userRow.lockedUntil,
    });

    if (user.isDeactivated) {
      const token = await this.flowTokenService.signSingleUse({
        type: JwtTokenType.ACCOUNT_REACTIVATION,
        purpose: 'account_reactivation',
        subjectId: input.userId,
        payload: { sub: input.userId, credentialId: input.credentialId ?? undefined, method: input.authMethod },
        expiresIn: '10m',
      });

      return { reactivationRequired: true, token };
    }

    // MFA-enabled Accounts are not partially logged in. The primary method has
    // been proven, but there is deliberately no Session yet.
    if (userRow.mfaEnabled) {
      return await this.createMfaChallengeCommand.execute({
        userId: input.userId,
        credentialId: input.credentialId ?? null,
        authMethod: input.authMethod,
      });
    }

    const session = await this.createSessionCommand.execute({
      userId: input.userId,
      credentialId: input.credentialId ?? null,
      authMethod: input.authMethod,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceName: input.deviceName,
    });

    return session;
  }
}
