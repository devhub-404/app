import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { MagicLinkTokenDTO } from '@/modules/auth/application/shared/dto';
import { HandleAuthenticatedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-authenticated-login.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import {
  CompleteMagicLinkLoginInputDTO,
  CompleteMagicLinkLoginResultDTO,
} from '@/modules/auth/application/magic-link/dtos';

@Injectable()
export class CompleteMagicLinkLoginCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    private readonly handleAuthenticatedUserCommand: HandleAuthenticatedLoginCommand,
  ) {}

  async execute(input: CompleteMagicLinkLoginInputDTO): Promise<CompleteMagicLinkLoginResultDTO> {
    let payload: MagicLinkTokenDTO;

    try {
      payload = await this.flowTokenService.verifySingleUse(MagicLinkTokenDTO, input.token, 'magic_link');
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const user = await this.accountService.findVerifiedPrimaryEmailAccount(payload.email);

    if (!user) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    if (!(await this.flowTokenService.consumeSingleUse(payload, 'magic_link'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    let result: CompleteMagicLinkLoginResultDTO;
    try {
      result = await this.handleAuthenticatedUserCommand.execute({
        userId: user.userId,
        email: payload.email,
        credentialId: null,
        authMethod: 'magic_link',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
    } catch {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    if ('restoreAccessRequested' in result) {
      return result;
    }

    // The return target is part of the signed magic-link proof. Preserve it
    // through MFA/reactivation so the final Session resumes the original task.
    return {
      ...result,
      redirect: payload.redirect ?? null,
    };
  }
}
