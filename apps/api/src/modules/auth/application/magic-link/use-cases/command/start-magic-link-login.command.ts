import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import {
  USER_MAGIC_LINK_LOGIN_REQUESTED_EVENT,
  MagicLinkLoginRequestedEvent,
} from '@/modules/auth/application/core/events/magic-link-login-requested.event';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { getSafeRedirect } from '@/modules/auth/application/shared/get-safe-redirect';
import { GenericPublicAckDTO } from '@/modules/auth/application/shared/dto';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { StartMagicLinkLoginInputDTO } from '@/modules/auth/application/magic-link/dtos';

@Injectable()
export class StartMagicLinkLoginCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    private readonly eventEmitter: EventEmitter2,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(input: StartMagicLinkLoginInputDTO): Promise<GenericPublicAckDTO> {
    const user = await this.accountService.findVerifiedPrimaryEmailAccount(input.email);

    if (!user) {
      return { acknowledged: true };
    }

    const redirect = getSafeRedirect(input.redirect, this.config.siteUrl);
    const token = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.MAGIC_LINK,
      purpose: 'magic_link',
      payload: { email: input.email, redirect },
      expiresIn: '10m',
    });

    await emitBestEffort(
      this.eventEmitter,
      USER_MAGIC_LINK_LOGIN_REQUESTED_EVENT,
      new MagicLinkLoginRequestedEvent(input.email, token),
    );

    return { acknowledged: true };
  }
}
