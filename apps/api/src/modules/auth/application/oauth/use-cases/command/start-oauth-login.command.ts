import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { createPkcePair } from '@/modules/auth/application/oauth/pkce';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { OAuthAuthorizationResultDTO, StartOAuthLoginInputDTO } from '@/modules/auth/application/oauth/dtos';

@Injectable()
export class StartOAuthLoginCommand {
  constructor(
    private readonly oauthProviderFactory: OAuthProviderFactory,
    private readonly flowTokenService: FlowTokenService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(input: StartOAuthLoginInputDTO): Promise<OAuthAuthorizationResultDTO> {
    const oauthProvider = this.oauthProviderFactory.get(input.provider);

    const state = randomUUID();
    const { codeVerifier, codeChallenge } = createPkcePair();

    const stateToken = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.OAUTH_STATE,
      purpose: 'oauth_state',
      payload: { state, action: 'login', provider: input.provider },
      expiresIn: '10m',
    });

    const url = oauthProvider.getAuthorizationUrl({
      redirectUri: this.config.oauth[input.provider].redirectUri,
      state: stateToken,
      codeChallenge,
      codeChallengeMethod: 'S256',
    });

    return { url, stateToken, browserContext: { state, codeVerifier } };
  }
}
