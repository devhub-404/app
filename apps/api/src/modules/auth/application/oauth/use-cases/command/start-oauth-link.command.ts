import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { createPkcePair } from '@/modules/auth/application/oauth/pkce';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { OAuthAuthorizationResultDTO, StartOAuthLinkInputDTO } from '@/modules/auth/application/oauth/dtos';

@Injectable()
export class StartOAuthLinkCommand {
  constructor(
    private readonly oauthProviderFactory: OAuthProviderFactory,
    private readonly flowTokenService: FlowTokenService,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(input: StartOAuthLinkInputDTO): Promise<OAuthAuthorizationResultDTO> {
    await this.requirePossessionProofCommand.execute(input.userId, input.sessionId);

    const oauthProvider = this.oauthProviderFactory.get(input.provider);

    const state = randomUUID();
    const { codeVerifier, codeChallenge } = createPkcePair();

    const stateToken = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.OAUTH_STATE,
      purpose: 'oauth_state',
      payload: { state, action: 'link', provider: input.provider, userId: input.userId },
      expiresIn: '10m',
    });

    const url = oauthProvider.getAuthorizationUrl({
      redirectUri: this.config.oauth[input.provider].linkRedirectUri,
      state: stateToken,
      codeChallenge,
      codeChallengeMethod: 'S256',
    });

    return { url, stateToken, browserContext: { state, codeVerifier } };
  }
}
