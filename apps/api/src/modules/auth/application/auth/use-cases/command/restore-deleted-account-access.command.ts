import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { AccountDeletionRestoreAccessTokenDTO } from '@/modules/auth/application/shared/dto';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';

/**
 * Verifies the restricted deletion-cancellation proof and restores Account state.
 * This command deliberately never creates a Session: after cancellation the user
 * must authenticate again through a primary Auth method.
 */
@Injectable()
export class RestoreDeletedAccountAccessCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    @Inject(ACCOUNT_SERVICE) private readonly accountService: AccountServicePort,
  ) {}

  async execute(token: string): Promise<void> {
    let payload: AccountDeletionRestoreAccessTokenDTO;
    try {
      payload = await this.flowTokenService.verifySingleUse(
        AccountDeletionRestoreAccessTokenDTO,
        token,
        'account_deletion_restore_access',
      );
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const account = await this.accountService.getAuthenticationView(payload.sub);
    if (!account) throw new AppError('AUTH_TOKEN_INVALID');

    if (account.deletionStatus === 'pending') {
      try {
        await this.accountService.restoreDeletedAccount(payload.sub);
      } catch (error) {
        if (
          !(error instanceof AppError) ||
          (error.message !== 'USER_INVALID_STATUS' && error.message !== 'USER_NOT_FOUND')
        ) {
          throw error;
        }
        const refreshed = await this.accountService.getAuthenticationView(payload.sub);
        if (!refreshed || refreshed.deletionStatus !== 'none') throw new AppError('AUTH_TOKEN_INVALID');
      }
    } else if (account.deletionStatus !== 'none') {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    // Consume after the monotonic Account transition. A transient proof-store
    // failure cannot strand the Account in PENDING after a valid cancellation.
    if (!(await this.flowTokenService.consumeSingleUse(payload, 'account_deletion_restore_access'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
  }
}
