import { forwardRef, Module } from '@nestjs/common';
import { EmailPublicModule } from '@/modules/email/public/email-public.module';
import { TokenModule } from '@/modules/auth/infrastructure/token.module';
import { AccountPublicModule } from '@/modules/account/public/account-public.module';
import { StartEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/start-email-verification.command';
import { CompleteEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/complete-email-verification.command';
import { ResendEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/resend-email-verification.command';
import { StartPrimaryEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/start-primary-email-change.command';
import { CompletePrimaryEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/complete-primary-email-change.command';
import { StartBackupEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/start-backup-email-change.command';
import { CompleteBackupEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/complete-backup-email-change.command';
import { DeleteBackupEmailCommand } from '@/modules/auth/application/emails/use-cases/command/delete-backup-email.command';
import { PossessionProofService } from '@/modules/auth/public/possession-proof.service';
import {
  PossessionProofServicePort,
  POSSESSION_PROOF_SERVICE,
} from '@/modules/auth/public/possession-proof.service.port';
import { AuthEmailsController } from '@/modules/auth/presentation/auth/auth-emails.controller';
import { AccountRecoveryController } from '@/modules/auth/presentation/auth/account-recovery.controller';
import { AuthMagicLinkController } from '@/modules/auth/presentation/auth/auth-magic-link.controller';
import { AuthMfaController } from '@/modules/auth/presentation/auth/auth-mfa.controller';
import { AuthOAuthController } from '@/modules/auth/presentation/auth/auth-oauth.controller';
import { AuthenticationMethodsController } from '@/modules/auth/presentation/auth/authentication-methods.controller';
import { AuthPasskeysController } from '@/modules/auth/presentation/auth/auth-passkeys.controller';
import { AuthPossessionProofController } from '@/modules/auth/presentation/auth/auth-possession-proof.controller';
import { AuthPasswordController } from '@/modules/auth/presentation/auth/auth-password.controller';
import { AuthSessionsController } from '@/modules/auth/presentation/auth/auth-sessions.controller';
import { UserAccountController } from '@/modules/auth/presentation/auth/user-account.controller';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { SessionTokenService } from '@/modules/auth/application/shared/session-token.service';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { SerenityOpaquePasswordService } from '@/modules/auth/infrastructure/opaque-password/serenity-opaque-password.service';
import { Sha256AuthSecretDigestService } from '@/modules/auth/infrastructure/security/sha256-auth-secret-digest.service';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { CredentialOAuthRepository } from '@/modules/auth/application/oauth/ports/credential-oauth.repository';
import { CredentialOAuthQueryRepository } from '@/modules/auth/application/oauth/ports/credential-oauth.query.repository';
import { CredentialPasskeyRepository } from '@/modules/auth/application/passkeys/ports/credential-passkey.repository';
import { DrizzleCredentialRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/credential.repository';
import { DrizzleCredentialPasswordRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/credential-password.repository';
import { DrizzleCredentialOAuthRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/credential-oauth.repository';
import { DrizzleCredentialOAuthQueryRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/credential-oauth.query.repository';
import { DrizzleCredentialPasskeyRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/credential-passkey.repository';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';
import { SessionAuthenticationQueryRepository } from '@/modules/auth/application/sessions/ports/session-authentication.query.repository';
import { SessionQueryRepository } from '@/modules/auth/application/sessions/ports/session.query.repository';
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/session.repository';
import { DrizzleSessionAuthenticationQueryRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/session-authentication.query.repository';
import { DrizzleSessionQueryRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/session.query.repository';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { DrizzleMfaTotpRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/mfa-totp.repository';
import { DrizzleMfaRecoveryCodeRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/mfa-recovery-code.repository';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { OtplibTotpService } from '@/modules/auth/infrastructure/totp/otplib-totp.service';
import { AesGcmTotpSecretCryptoService } from '@/modules/auth/infrastructure/totp/aes-gcm-totp-secret-crypto.service';
import { OAuthProviderFactory } from '@/modules/auth/domain/services/oauth-provider.factory';
import { OAuthProviderFactoryService } from '@/modules/auth/infrastructure/oauth/oauth-provider.factory';
import { GithubOAuthProvider } from '@/modules/auth/infrastructure/oauth/providers/github-oauth.provider';
import { GoogleOAuthProvider } from '@/modules/auth/infrastructure/oauth/providers/google-oauth.provider';
import { PasskeyService } from '@/modules/auth/domain/services/passkey.service';
import { SimpleWebAuthnPasskeyService } from '@/modules/auth/infrastructure/passkey/simplewebauthn-passkey.service';
import { StartAccountRecoveryCommand } from '@/modules/auth/application/auth/use-cases/command/start-account-recovery.command';
import { CompleteAccountRecoveryCommand } from '@/modules/auth/application/auth/use-cases/command/complete-account-recovery.command';
import { RestoreDeletedAccountAccessCommand } from '@/modules/auth/application/auth/use-cases/command/restore-deleted-account-access.command';
import { RestoreAccessEmailService } from '@/modules/auth/application/auth/application-services/restore-access-email.service';
import { HandleAuthenticatedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-authenticated-login.command';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { VerifyPossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/verify-possession-proof.command';
import { EvaluatePossessionProofRequirementQuery } from '@/modules/auth/application/auth/use-cases/query/evaluate-possession-proof-requirement.query';
import { GetCurrentUserQuery } from '@/modules/auth/application/auth/use-cases/query/get-current-user.query';
import { UserMeQueryRepository } from '@/modules/auth/application/auth/ports/user-me.query.repository';
import { DrizzleUserMeQueryRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/user-me.query.repository';
import { AuthFlowProofRepository } from '@/modules/auth/application/shared/ports/auth-flow-proof.repository';
import { DrizzleAuthFlowProofRepository } from '@/modules/auth/infrastructure/database/drizzle/repositories/auth-flow-proof.repository';
import { SendPossessionProofEmailCodeCommand } from '@/modules/auth/application/auth/use-cases/command/send-possession-proof-email-code.command';
import { HandleFailedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-failed-login.command';
import { StartPasswordRegistrationCommand } from '@/modules/auth/application/password/use-cases/command/start-password-registration.command';
import { CompletePasswordRegistrationCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-registration.command';
import { StartPasswordLoginCommand } from '@/modules/auth/application/password/use-cases/command/start-password-login.command';
import { CompletePasswordLoginCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-login.command';
import { StartPasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/start-password-recovery.command';
import { CompletePasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-recovery.command';
import { PreparePasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/prepare-password-recovery.command';
import { StartPasswordChangeCommand } from '@/modules/auth/application/password/use-cases/command/start-password-change.command';
import { CompletePasswordChangeCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-change.command';
import { StartPasswordCredentialCreationCommand } from '@/modules/auth/application/password/use-cases/command/start-password-credential-creation.command';
import { CompletePasswordCredentialCreationCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-credential-creation.command';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';
import { RevokeCurrentSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-current-session.command';
import { RevokeOtherSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-other-sessions.command';
import { RevokeSessionByIdCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-session-by-id.command';
import { GetCurrentSessionQuery } from '@/modules/auth/application/sessions/use-cases/query/get-current-session.query';
import { ListMySessionsQuery } from '@/modules/auth/application/sessions/use-cases/query/list-my-sessions.query';
import { StartTotpEnrollmentCommand } from '@/modules/auth/application/mfa/use-cases/command/start-totp-enrollment.command';
import { CompleteTotpEnrollmentCommand } from '@/modules/auth/application/mfa/use-cases/command/complete-totp-enrollment.command';
import { DisableTotpCommand } from '@/modules/auth/application/mfa/use-cases/command/disable-totp.command';
import { RegenerateRecoveryCodesCommand } from '@/modules/auth/application/mfa/use-cases/command/regenerate-recovery-codes.command';
import { VerifyTotpCommand } from '@/modules/auth/application/mfa/use-cases/command/verify-totp.command';
import { VerifyRecoveryCodeCommand } from '@/modules/auth/application/mfa/use-cases/command/verify-recovery-code.command';
import { GetMyMfaConfigurationQuery } from '@/modules/auth/application/mfa/use-cases/query/get-my-mfa-configuration.query';
import { MfaChallengeService } from '@/modules/auth/application/mfa/application-services/mfa-challenge.service';
import { StartMagicLinkLoginCommand } from '@/modules/auth/application/magic-link/use-cases/command/start-magic-link-login.command';
import { CompleteMagicLinkLoginCommand } from '@/modules/auth/application/magic-link/use-cases/command/complete-magic-link-login.command';
import { StartOAuthLoginCommand } from '@/modules/auth/application/oauth/use-cases/command/start-oauth-login.command';
import { CompleteOAuthLoginCommand } from '@/modules/auth/application/oauth/use-cases/command/complete-oauth-login.command';
import { StartOAuthLinkCommand } from '@/modules/auth/application/oauth/use-cases/command/start-oauth-link.command';
import { CompleteOAuthLinkCommand } from '@/modules/auth/application/oauth/use-cases/command/complete-oauth-link.command';
import { StartPasskeyLoginCommand } from '@/modules/auth/application/passkeys/use-cases/command/start-passkey-login.command';
import { CompletePasskeyLoginCommand } from '@/modules/auth/application/passkeys/use-cases/command/complete-passkey-login.command';
import { StartPasskeyRegistrationCommand } from '@/modules/auth/application/passkeys/use-cases/command/start-passkey-registration.command';
import { CompletePasskeyRegistrationCommand } from '@/modules/auth/application/passkeys/use-cases/command/complete-passkey-registration.command';
import { UpdatePasskeyDeviceNameCommand } from '@/modules/auth/application/passkeys/use-cases/command/update-passkey-device-name.command';
import { DeleteCredentialCommand } from '@/modules/auth/application/passkeys/use-cases/command/delete-credential.command';
import { ListPasskeyDevicesQuery } from '@/modules/auth/application/passkeys/use-cases/query/list-passkey-devices.query';
import { HandleMagicLinkLoginRequestedListener } from '@/modules/auth/application/core/listeners/handle-magic-link-login-requested.listener';
import { HandleUserEmailVerificationRequestedListener } from '@/modules/auth/application/core/listeners/handle-user-email-verification-requested.listener';
import { HandleUserPossessionProofEmailCodeRequestedListener } from '@/modules/auth/application/core/listeners/handle-user-possession-proof-email-code-requested.listener';
import { HandleAccountRecoveryEmailRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-recovery-email-requested.listener';
import { HandleRestoreAccessEmailRequestedListener } from '@/modules/auth/application/core/listeners/handle-restore-access-email-requested.listener';
import { HandleAccountDeactivatedEmailRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-deactivated-email-requested.listener';
import { HandleAccountDeletionEmailRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-deletion-email-requested.listener';
import { HandleUserPasswordResetRequestedListener } from '@/modules/auth/application/core/listeners/handle-user-password-reset-requested.listener';
import { HandleAccountDeactivatedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-deactivated.command';
import { HandleAccountDeletionRequestedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-deletion-requested.command';
import { HandleAccountSuspendedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-suspended.command';
import { HandleAccountBannedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-banned.command';
import { PurgeExpiredAuthArtifactsCommand } from '@/modules/auth/application/auth/use-cases/command/purge-expired-auth-artifacts.command';
import { ReactivateAccountFromTokenCommand } from '@/modules/auth/application/auth/use-cases/command/reactivate-account-from-token.command';
import { SessionAccessValidationPort } from '@/modules/auth/public/session-access-validation.port';
import { SessionAccessValidationService } from '@/modules/auth/public/session-access-validation.service';
import { HandleAuthAccountPurgeRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-purge-requested.listener';

@Module({
  imports: [EmailPublicModule, TokenModule, forwardRef(() => AccountPublicModule)],
  controllers: [
    AuthEmailsController,
    AccountRecoveryController,
    AuthMagicLinkController,
    AuthMfaController,
    AuthOAuthController,
    AuthenticationMethodsController,
    AuthPasskeysController,
    AuthPossessionProofController,
    AuthPasswordController,
    AuthSessionsController,
    UserAccountController,
  ],
  providers: [
    FlowTokenService,
    SessionTokenService,
    { provide: UserMeQueryRepository, useClass: DrizzleUserMeQueryRepository },
    { provide: AuthFlowProofRepository, useClass: DrizzleAuthFlowProofRepository },
    { provide: OpaquePasswordService, useClass: SerenityOpaquePasswordService },
    { provide: AuthSecretDigestService, useClass: Sha256AuthSecretDigestService },
    { provide: PossessionProofServicePort, useClass: PossessionProofService },
    { provide: SessionAccessValidationPort, useClass: SessionAccessValidationService },
    { provide: POSSESSION_PROOF_SERVICE, useExisting: PossessionProofServicePort },
    { provide: CredentialRepository, useClass: DrizzleCredentialRepository },
    { provide: CredentialPasswordRepository, useClass: DrizzleCredentialPasswordRepository },
    { provide: CredentialOAuthRepository, useClass: DrizzleCredentialOAuthRepository },
    { provide: CredentialOAuthQueryRepository, useClass: DrizzleCredentialOAuthQueryRepository },
    { provide: CredentialPasskeyRepository, useClass: DrizzleCredentialPasskeyRepository },
    { provide: SessionRepository, useClass: DrizzleSessionRepository },
    { provide: SessionAuthenticationQueryRepository, useClass: DrizzleSessionAuthenticationQueryRepository },
    { provide: SessionQueryRepository, useClass: DrizzleSessionQueryRepository },
    { provide: MfaTotpRepository, useClass: DrizzleMfaTotpRepository },
    { provide: MfaRecoveryCodeRepository, useClass: DrizzleMfaRecoveryCodeRepository },
    { provide: TotpService, useClass: OtplibTotpService },
    { provide: TotpSecretCryptoService, useClass: AesGcmTotpSecretCryptoService },
    { provide: OAuthProviderFactory, useClass: OAuthProviderFactoryService },
    GithubOAuthProvider,
    GoogleOAuthProvider,
    { provide: PasskeyService, useClass: SimpleWebAuthnPasskeyService },
    RestoreAccessEmailService,
    StartEmailVerificationCommand,
    CompleteEmailVerificationCommand,
    ResendEmailVerificationCommand,
    StartPrimaryEmailChangeCommand,
    CompletePrimaryEmailChangeCommand,
    StartBackupEmailChangeCommand,
    CompleteBackupEmailChangeCommand,
    DeleteBackupEmailCommand,
    StartAccountRecoveryCommand,
    CompleteAccountRecoveryCommand,
    RestoreDeletedAccountAccessCommand,
    HandleAuthenticatedLoginCommand,
    ReactivateAccountFromTokenCommand,
    RequirePossessionProofCommand,
    VerifyPossessionProofCommand,
    EvaluatePossessionProofRequirementQuery,
    GetCurrentUserQuery,
    SendPossessionProofEmailCodeCommand,
    HandleFailedLoginCommand,
    StartPasswordRegistrationCommand,
    CompletePasswordRegistrationCommand,
    StartPasswordLoginCommand,
    CompletePasswordLoginCommand,
    StartPasswordRecoveryCommand,
    CompletePasswordRecoveryCommand,
    PreparePasswordRecoveryCommand,
    StartPasswordChangeCommand,
    CompletePasswordChangeCommand,
    StartPasswordCredentialCreationCommand,
    CompletePasswordCredentialCreationCommand,
    IssueSessionCommand,
    RevokeAllSessionsCommand,
    RevokeCurrentSessionCommand,
    RevokeOtherSessionsCommand,
    RevokeSessionByIdCommand,
    GetCurrentSessionQuery,
    ListMySessionsQuery,
    MfaChallengeService,
    StartTotpEnrollmentCommand,
    CompleteTotpEnrollmentCommand,
    DisableTotpCommand,
    RegenerateRecoveryCodesCommand,
    VerifyTotpCommand,
    VerifyRecoveryCodeCommand,
    GetMyMfaConfigurationQuery,
    StartMagicLinkLoginCommand,
    CompleteMagicLinkLoginCommand,
    StartOAuthLoginCommand,
    CompleteOAuthLoginCommand,
    StartOAuthLinkCommand,
    CompleteOAuthLinkCommand,
    StartPasskeyLoginCommand,
    CompletePasskeyLoginCommand,
    StartPasskeyRegistrationCommand,
    CompletePasskeyRegistrationCommand,
    UpdatePasskeyDeviceNameCommand,
    DeleteCredentialCommand,
    ListPasskeyDevicesQuery,
    HandleMagicLinkLoginRequestedListener,
    HandleUserEmailVerificationRequestedListener,
    HandleUserPossessionProofEmailCodeRequestedListener,
    HandleAccountRecoveryEmailRequestedListener,
    HandleRestoreAccessEmailRequestedListener,
    HandleAccountDeactivatedEmailRequestedListener,
    HandleAccountDeletionEmailRequestedListener,
    HandleUserPasswordResetRequestedListener,
    HandleAccountDeactivatedCommand,
    HandleAccountDeletionRequestedCommand,
    HandleAccountSuspendedCommand,
    HandleAccountBannedCommand,
    PurgeExpiredAuthArtifactsCommand,
    HandleAuthAccountPurgeRequestedListener,
  ],
  exports: [
    POSSESSION_PROOF_SERVICE,
    PossessionProofServicePort,
    SessionAccessValidationPort,
    PurgeExpiredAuthArtifactsCommand,
  ],
})
export class AuthModule {}
