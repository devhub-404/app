import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import {
  USER_PASSWORD_RESET_REQUESTED_EVENT,
  UserPasswordResetRequestedEvent,
} from '@/modules/auth/application/core/events/user-password-reset-requested.event';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { GenericPublicAckDTO } from '@/modules/auth/application/shared/dto';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { StartPasswordRecoveryInputDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class StartPasswordRecoveryCommand {
  constructor(
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    private readonly flowTokenService: FlowTokenService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: StartPasswordRecoveryInputDTO): Promise<GenericPublicAckDTO> {
    // 1. Find verified primary email — return silently if not found (don't leak existence)
    const user = await this.accountService.findVerifiedPrimaryEmailAccount(input.email);
    if (!user) {
      return { acknowledged: true };
    }

    const userRow = await this.accountService.getAuthenticationView(user.userId);
    if (!userRow || userRow.status === 'banned' || userRow.deletedAt) {
      return { acknowledged: true };
    }

    // 2. Check that a password credential exists
    const credentialPassword = await this.credentialPasswordRepository.findByUserId(user.userId);
    if (!credentialPassword) {
      return { acknowledged: true };
    }

    // 3. Sign password reset token
    const token = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.PASSWORD_RESET,
      purpose: 'password_reset',
      payload: { sub: user.userId, email: input.email },
      expiresIn: '15m',
    });

    // 4. Emit event so a listener can send the recovery email
    await emitBestEffort(
      this.eventEmitter,
      USER_PASSWORD_RESET_REQUESTED_EVENT,
      new UserPasswordResetRequestedEvent(user.userId, input.email, token),
    );

    return { acknowledged: true };
  }
}
