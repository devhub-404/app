import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';
import type { OAuthProviderName } from '@/modules/auth/domain/services/oauth-provider.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { OAuthStateTokenDTO } from '@/modules/auth/application/shared/dto';
import { CredentialOAuthRepository } from '@/modules/auth/application/oauth/ports/credential-oauth.repository';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { AppError } from '@/shared/errors/app-error';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { HandleAuthenticatedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-authenticated-login.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { ACCOUNT_CREATED_EVENT, AccountCreatedEvent } from '@/modules/account/public/events';
import { UnitOfWork } from '@/shared/kernel/services/unit-of-work';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { CompleteOAuthLoginInputDTO, CompleteOAuthLoginResultDTO } from '@/modules/auth/application/oauth/dtos';

@Injectable()
export class CompleteOAuthLoginCommand {
  constructor(
    private readonly oauthProviderFactory: OAuthProviderFactory,
    private readonly flowTokenService: FlowTokenService,
    private readonly credentialOAuthRepository: CredentialOAuthRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly userRepository: AccountAccessPort,
    private readonly userEmailRepository: AccountEmailAccessPort,
    private readonly unitOfWork: UnitOfWork,
    private readonly handleAuthenticatedUserCommand: HandleAuthenticatedLoginCommand,
    private readonly eventEmitter: EventEmitter2,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(
    provider: OAuthProviderName,
    input: CompleteOAuthLoginInputDTO,
  ): Promise<CompleteOAuthLoginResultDTO> {
    let statePayload: OAuthStateTokenDTO;
    try {
      statePayload = await this.flowTokenService.verifySingleUse(OAuthStateTokenDTO, input.stateToken, 'oauth_state');
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
    if (
      statePayload.action !== 'login' ||
      statePayload.provider !== provider ||
      statePayload.userId !== undefined ||
      statePayload.state !== input.browserState
    ) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const oauthProvider = this.oauthProviderFactory.get(provider);

    const tokens = await oauthProvider.exchangeCodeForTokens({
      redirectUri: this.config.oauth[provider].redirectUri,
      code: input.code,
      codeVerifier: input.codeVerifier,
    });

    const profile = await oauthProvider.getUserProfile(tokens.accessToken);
    if (!(await this.flowTokenService.consumeSingleUse(statePayload, 'oauth_state'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
    // AUTH-RN-002: OAuth may auto-associate/provision by email only when the
    // provider contract attests that the returned address is verified. Keeping
    // this check at the application boundary prevents a future adapter or test
    // double from silently weakening that invariant.
    if (profile.emailVerified !== true) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    let userId: string;
    let credentialId: string;

    const existingOAuthCredential = await this.credentialOAuthRepository.findByProviderAndUserId(
      provider,
      profile.providerUserId,
    );

    if (existingOAuthCredential) {
      userId = existingOAuthCredential.userId;
      credentialId = existingOAuthCredential.credentialId;

      const userRow = await this.accountService.getAuthenticationView(userId);
      if (!userRow) {
        throw new AppError('AUTH_INVALID_CREDENTIAL');
      }
      try {
        assertUserCanAuthenticate({
          id: userRow.userId,
          status: userRow.status,
          mfaEnabled: userRow.mfaEnabled,
          lockedUntil: userRow.lockedUntil,
        });
      } catch {
        throw new AppError('AUTH_INVALID_CREDENTIAL');
      }
      if (userRow.deletedAt) {
        return await this.handleAuthenticatedUserCommand.execute({
          userId,
          email: profile.email,
          credentialId,
          authMethod: 'oauth',
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });
      }
    } else {
      const existingUser = await this.userRepository.findByEmail(profile.email);

      if (existingUser) {
        userId = existingUser.userId;

        const userRow = await this.accountService.getAuthenticationView(userId);
        if (!userRow) {
          throw new AppError('AUTH_INVALID_CREDENTIAL');
        }
        try {
          assertUserCanAuthenticate({
            id: userRow.userId,
            status: userRow.status,
            mfaEnabled: userRow.mfaEnabled,
            lockedUntil: userRow.lockedUntil,
          });
        } catch {
          throw new AppError('AUTH_INVALID_CREDENTIAL');
        }
        if (userRow.deletedAt) {
          return await this.handleAuthenticatedUserCommand.execute({
            userId,
            email: profile.email,
            credentialId: null,
            authMethod: 'oauth',
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
          });
        }

        // OAuth providers assert control of the returned email. When linking
        // by email, promote that existing primary address to verified so the
        // centralized Session invariant remains compatible with OAuth login.
        await this.userEmailRepository.setVerifiedAt(userId, profile.email, new Date());

        const credential = await this.credentialRepository.createOAuth({
          userId,
          provider,
          providerUserId: profile.providerUserId,
        });
        credentialId = credential.id;
      } else {
        const provisioned = await this.unitOfWork.run(async () => {
          // Repeat the lookup on the transaction's primary connection. If a
          // concurrent signup won first, do not create a second Account.
          const racedUser = await this.userRepository.findByEmail(profile.email);
          if (racedUser) throw new AppError('USER_ALREADY_EXISTS');

          const createdUserId = await this.userRepository.create({
            email: profile.email,
            emailVerifiedAt: new Date(),
          });
          const credential = await this.credentialRepository.createOAuth({
            userId: createdUserId,
            provider,
            providerUserId: profile.providerUserId,
          });

          return { userId: createdUserId, credentialId: credential.id };
        });
        userId = provisioned.userId;
        credentialId = provisioned.credentialId;
        this.eventEmitter.emit(
          ACCOUNT_CREATED_EVENT,
          new AccountCreatedEvent(userId, {
            source: 'oauth',
            provider,
            avatarUrl: profile.avatarUrl,
          }),
        );
      }
    }

    await this.credentialRepository.updateLastUsedAt(credentialId);

    return await this.handleAuthenticatedUserCommand.execute({
      userId,
      email: profile.email,
      credentialId,
      authMethod: 'oauth',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }
}
