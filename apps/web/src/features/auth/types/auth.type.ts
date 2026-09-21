import type { components, paths } from '@devhub-404/api-contract';

export type OAuthAuthorizationDTO = components['schemas']['OAuthAuthorizationDTO'];
export type PasswordLoginCompleteDTO = components['schemas']['PasswordLoginCompleteDTO'];
export type PasskeyLoginDTO = components['schemas']['PasskeyLoginDTO'];
export type MagicLinkLoginDTO = components['schemas']['MagicLinkLoginDTO'];
export type OAuthLoginDTO = components['schemas']['OAuthLoginDTO'];
export type MfaRecoveryCodeSessionDTO = components['schemas']['MfaRecoveryCodeSessionDTO'];
export type PasskeyChallengeDTO = components['schemas']['PasskeyChallengeDTO'];
export type PasskeyDeviceDTO = components['schemas']['PasskeyDeviceDTO'];
export type PasskeyRegisteredDTO = components['schemas']['PasskeyRegisteredDTO'];
export type PasswordRegistrationCompletedDTO = components['schemas']['PasswordRegistrationCompletedDTO'];
export type PasswordCredentialCreatedDTO = components['schemas']['PasswordCredentialCreatedDTO'];
export type PasswordChangedDTO = components['schemas']['PasswordChangedDTO'];
export type PasswordRegisterStartResponseDTO = components['schemas']['PasswordRegisterStartResponseDTO'];
export type PasswordLoginStartResponseDTO = components['schemas']['PasswordLoginStartResponseDTO'];
export type PasswordChangeStartResponseDTO = components['schemas']['PasswordChangeStartResponseDTO'];
export type PasswordRecoverPrepareResponseDTO = components['schemas']['PasswordRecoverPrepareResponseDTO'];
export type ForgotPasswordDTO = components['schemas']['PasswordRecoverStartDTO'];
export type PossessionProofCompleteDTO = components['schemas']['PossessionProofCompleteDTO'];
export type PossessionProofRequirementResultDTO = components['schemas']['PossessionProofRequirementResultDTO'];
export type PossessionProofStartedDTO = components['schemas']['PossessionProofStartedDTO'];
export type MfaConfigurationDTO = components['schemas']['MfaConfigurationDTO'];
export type MfaDisableDTO = components['schemas']['MfaDisableDTO'];
export type GenericPublicAckDTO = components['schemas']['GenericPublicAckDTO'];
export type AccountRecoveredDTO = components['schemas']['AccountRecoveredDTO'];
export type PasswordRecoveryCompletedDTO = components['schemas']['PasswordRecoveryCompletedDTO'];
export type EmailVerifiedDTO = components['schemas']['EmailVerifiedDTO'];
export type MfaRecoveryCodesDTO = components['schemas']['MfaRecoveryCodesDTO'];
export type MfaTotpEnrollCompleteDTO = components['schemas']['MfaTotpEnrollCompleteDTO'];
export type MfaTotpEnrollCompleteResponseDTO = components['schemas']['MfaTotpEnrollCompleteResponseDTO'];
export type MfaTotpEnrollStartDTO = components['schemas']['MfaTotpEnrollStartDTO'];
export type ResendVerificationEmailDTO = components['schemas']['EmailChangeDTO'];
export type OAuthProvider = NonNullable<
  paths['/api/v1/oauth/{provider}/login/start']['post']['parameters']['path']
>['provider'];
