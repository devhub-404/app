import { Inject, Injectable } from '@nestjs/common';
import { SessionTokenService } from '@/modules/auth/application/shared/session-token.service';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { AppError } from '@/shared/errors/app-error';
import { IssueSessionInputDTO } from '@/modules/auth/application/sessions/dtos/in';
import { IssueSessionResultDTO } from '@/modules/auth/application/sessions/dtos/out';

@Injectable()
export class IssueSessionCommand {
  constructor(
    private readonly sessionTokenService: SessionTokenService,
    @Inject(ACCOUNT_SERVICE) private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: IssueSessionInputDTO): Promise<IssueSessionResultDTO> {
    const authView = await this.accountService.getAuthenticationView(input.userId);
    if (!authView) throw new AppError('USER_NOT_FOUND');
    if (
      authView.voluntaryStatus !== 'active' ||
      authView.moderationStatus !== 'none' ||
      authView.deletionStatus !== 'none' ||
      (authView.lockedUntil !== null && authView.lockedUntil.getTime() > Date.now())
    ) {
      throw new AppError('USER_CANNOT_AUTHENTICATE');
    }
    if (!authView.primaryEmailVerified) throw new AppError('AUTH_REQUIRED');
    if (authView.mfaEnabled && input.mfaVerified !== true) throw new AppError('AUTH_REQUIRED');

    return this.sessionTokenService.createSessionWithTokens({
      userId: input.userId,
      credentialId: input.credentialId,
      authMethod: input.authMethod,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceName: input.deviceName,
    });
  }
}
