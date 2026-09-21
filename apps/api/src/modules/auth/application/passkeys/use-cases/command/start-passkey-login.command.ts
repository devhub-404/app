import { Inject, Injectable } from '@nestjs/common';
import { PasskeyService } from '@/modules/auth/domain/services/passkey.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { PasskeyChallengeDTO } from '@/modules/auth/application/passkeys/dtos/out';

@Injectable()
export class StartPasskeyLoginCommand {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly flowTokenService: FlowTokenService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(): Promise<PasskeyChallengeDTO> {
    const result = await this.passkeyService.generateAuthenticationOptions({
      rpID: this.config.auth.passkeyRpId,
    });

    const stateToken = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.PASSKEY_STATE,
      purpose: 'passkey_state',
      payload: { action: 'login', challenge: result.challenge },
      expiresIn: '10m',
    });

    return { options: result.options, stateToken };
  }
}
