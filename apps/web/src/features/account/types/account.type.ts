import type { components, paths } from '@devhub-404/api-contract';

export type AccountDetailsDTO = components['schemas']['AccountDetailsDTO'];
export type AccountShellDTO = components['schemas']['AccountShellDTO'];
export type AuthIdentityDTO = components['schemas']['AuthenticationMethodDTO'];
export type AuthSessionDTO = components['schemas']['SessionDTO'];
export type CreateEmailDTO = components['schemas']['EmailChangeDTO'];
export type EmailDTO = components['schemas']['AccountEmailDTO'];
export type EmailChangeCompletedDTO = components['schemas']['EmailChangeCompletedDTO'];
export type GenericAuthenticatedAckDTO = components['schemas']['GenericAuthenticatedAckDTO'];
export type GenericPublicAckDTO = components['schemas']['GenericPublicAckDTO'];
export type LinkOAuthDTO = components['schemas']['CompleteOAuthLinkDTO'];
export type OAuthLinkDTO = components['schemas']['OAuthCredentialLinkedDTO'];
export type OAuthProvider = NonNullable<
  paths['/api/v1/oauth/{provider}/link/start']['post']['parameters']['path']
>['provider'];
export type PreferencesDTO = components['schemas']['AccountPreferencesDTO'];
export type ResendVerificationEmailDTO = components['schemas']['EmailChangeDTO'];
export type UpdatePreferencesDTO = components['schemas']['UpdateAccountPreferencesDTO'];
export type UserDTO = components['schemas']['AccountSummaryDTO'];
export type UserStatus = components['schemas']['AccountSummaryDTO']['status'];
export type VerifyEmailDTO = components['schemas']['EmailTokenDTO'];
