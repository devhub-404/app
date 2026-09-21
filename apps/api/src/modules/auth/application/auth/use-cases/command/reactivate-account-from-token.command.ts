import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { AccountReactivationTokenDTO } from '@/modules/auth/application/auth/dtos/in';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { MfaChallengeService } from '@/modules/auth/application/mfa/application-services/mfa-challenge.service';
import { ReactivateAccountInputDTO, HandleAuthenticatedLoginResultDTO } from '@/modules/auth/application/auth/dtos';

@Injectable()
export class ReactivateAccountFromTokenCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    @Inject(ACCOUNT_SERVICE) private readonly accountService: AccountServicePort,
    private readonly issueSessionCommand: IssueSessionCommand,
    private readonly mfaChallengeService: MfaChallengeService,
  ) {}

  async execute(input: ReactivateAccountInputDTO): Promise<HandleAuthenticatedLoginResultDTO> {
    let payload: AccountReactivationTokenDTO;
    try {
      payload = await this.flowTokenService.verifySingleUse(
        AccountReactivationTokenDTO,
        input.token,
        'account_reactivation',
      );
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    if (!(await this.flowTokenService.consumeSingleUse(payload, 'account_reactivation'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    await this.accountService.reactivateMe(payload.sub);
    const auth = await this.accountService.getAuthenticationView(payload.sub);
    if (!auth) throw new AppError('USER_NOT_FOUND');

    if (auth.mfaEnabled) {
      return await this.mfaChallengeService.execute({
        userId: payload.sub,
        credentialId: payload.credentialId ?? null,
        authMethod: payload.method,
      });
    }

    return await this.issueSessionCommand.execute({
      userId: payload.sub,
      credentialId: payload.credentialId ?? null,
      authMethod: payload.method,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }
}
