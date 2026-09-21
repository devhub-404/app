import { Inject, Injectable } from '@nestjs/common';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';
import type { OAuthProviderName } from '@/modules/auth/domain/services/oauth-provider.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { OAuthStateTokenDTO } from '@/modules/auth/application/shared/dto';
import { CredentialOAuthRepository } from '@/modules/auth/application/oauth/ports/credential-oauth.repository';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AppError } from '@/shared/errors/app-error';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { OAuthCredentialLinkedDTO } from '@/modules/auth/application/oauth/dtos/out';
import { CompleteOAuthLinkInputDTO } from '@/modules/auth/application/oauth/dtos/in';

@Injectable()
export class CompleteOAuthLinkCommand {
  constructor(
    private readonly oauthProviderFactory: OAuthProviderFactory,
    private readonly flowTokenService: FlowTokenService,
    private readonly credentialOAuthRepository: CredentialOAuthRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(
    provider: OAuthProviderName,
    input: CompleteOAuthLinkInputDTO,
  ): Promise<OAuthCredentialLinkedDTO> {
    await this.requirePossessionProofCommand.execute(input.userId, input.sessionId);

    const statePayload = await this.flowTokenService.verifySingleUse(
      OAuthStateTokenDTO,
      input.stateToken,
      'oauth_state',
    );
    if (
      statePayload.action !== 'link' ||
      statePayload.provider !== provider ||
      statePayload.userId !== input.userId ||
      statePayload.state !== input.browserState
    ) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const oauthProvider = this.oauthProviderFactory.get(provider);

    const tokens = await oauthProvider.exchangeCodeForTokens({
      redirectUri: this.config.oauth[provider].linkRedirectUri,
      code: input.code,
      codeVerifier: input.codeVerifier,
    });

    const profile = await oauthProvider.getUserProfile(tokens.accessToken);
    if (!(await this.flowTokenService.consumeSingleUse(statePayload, 'oauth_state'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const existingOAuthCredential = await this.credentialOAuthRepository.findByProviderAndUserId(
      provider,
      profile.providerUserId,
    );

    if (existingOAuthCredential) {
      if (existingOAuthCredential.userId !== input.userId) {
        throw new AppError('USER_ALREADY_EXISTS');
      }

      return { credentialId: existingOAuthCredential.credentialId };
    }

    const credential = await this.credentialRepository.createOAuth({
      userId: input.userId,
      provider,
      providerUserId: profile.providerUserId,
    });

    return { credentialId: credential.id };
  }
}
