import { privateClient } from '@/shared/api';
import { publicClient, type ApiClient } from '@/shared/api';
import { readApiData, type ApiResult } from '@/shared/api';
import type {
  AccountDetailsDTO,
  AccountShellDTO,
  AuthIdentityDTO,
  AuthSessionDTO,
  CreateEmailDTO,
  EmailChangeCompletedDTO,
  GenericAuthenticatedAckDTO,
  GenericPublicAckDTO,
  LinkOAuthDTO,
  OAuthLinkDTO,
  OAuthProvider,
  ResendVerificationEmailDTO,
  UpdatePreferencesDTO,
  PreferencesDTO,
  VerifyEmailDTO,
} from '@/features/account/types/account.type.ts';

export class AccountApi {
  static async getMe(): Promise<ApiResult<AccountShellDTO>> {
    return privateClient.GET('/api/v1/me', { headers: { 'x-devhub-session-resolution': 'true' } });
  }

  static async getDetails(client: ApiClient = privateClient): Promise<ApiResult<AccountDetailsDTO>> {
    return client.GET('/api/v1/me/details', { headers: { 'x-devhub-session-resolution': 'true' } });
  }

  static async deleteMe(): Promise<ApiResult<unknown>> {
    return privateClient.DELETE('/api/v1/me');
  }

  static async disableMe(): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/me/deactivate');
  }

  static async updatePreferences(payload: UpdatePreferencesDTO): Promise<ApiResult<PreferencesDTO>> {
    return privateClient.PATCH('/api/v1/me/preferences', {
      body: payload,
    });
  }

  static async getPreferences(): Promise<ApiResult<PreferencesDTO>> {
    return privateClient.GET('/api/v1/me/preferences');
  }

  static async listSessions(client: ApiClient = privateClient): Promise<ApiResult<AuthSessionDTO[]>> {
    const result = await client.GET('/api/v1/sessions');
    const items = readApiData<{ items?: AuthSessionDTO[] }>(result)?.items ?? [];
    return {
      data: { data: items },
      response: result.response,
    };
  }

  static async logoutAllSessions(): Promise<ApiResult<unknown>> {
    const result = await privateClient.DELETE('/api/v1/sessions');
    return result;
  }

  static async logoutOtherSessions(): Promise<ApiResult<unknown>> {
    const result = await privateClient.DELETE('/api/v1/sessions/others');
    return result;
  }

  static async revokeSession(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.DELETE('/api/v1/sessions/{sessionId}', {
      params: { path: { sessionId: id } },
    });
    return result;
  }

  static async listOAuthLinks(): Promise<ApiResult<AuthIdentityDTO[]>> {
    const result = await privateClient.GET('/api/v1/authentication-methods');
    return result;
  }

  static async linkOAuthProvider(provider: OAuthProvider, payload: LinkOAuthDTO): Promise<ApiResult<OAuthLinkDTO>> {
    const result = await privateClient.POST('/api/v1/oauth/{provider}/link/complete', {
      params: { path: { provider } },
      body: payload,
      credentials: 'include',
    });
    return result;
  }

  static async unlinkOAuthProvider(provider: Exclude<OAuthProvider, 'local'>): Promise<ApiResult<unknown>> {
    const methods = await this.listOAuthLinks();
    const identity = methods.data?.data?.find((item) => item.provider === provider);
    if (!identity)
      return {
        error: {
          code: 'AUTHENTICATION_METHOD_NOT_FOUND',
          message: 'AUTHENTICATION_METHOD_NOT_FOUND',
        },
      };
    const result = await privateClient.DELETE('/api/v1/credentials/{credentialId}', {
      params: { path: { credentialId: identity.id } },
    });
    return result;
  }

  static async requestPrimaryEmailChange(payload: CreateEmailDTO): Promise<ApiResult<GenericAuthenticatedAckDTO>> {
    return privateClient.POST('/api/v1/emails/primary/change/start', {
      body: payload,
    });
  }

  static async completePrimaryEmailChange(payload: VerifyEmailDTO): Promise<ApiResult<EmailChangeCompletedDTO>> {
    return publicClient.POST('/api/v1/emails/primary/change/complete', {
      body: payload,
    });
  }

  static async requestAddEmail(payload: CreateEmailDTO): Promise<ApiResult<GenericAuthenticatedAckDTO>> {
    return privateClient.POST('/api/v1/emails/backup/change/start', {
      body: payload,
    });
  }

  static async startEmailVerification(): Promise<ApiResult<GenericAuthenticatedAckDTO>> {
    return privateClient.POST('/api/v1/emails/verify/start');
  }

  static async resendAddEmailVerification(
    payload: ResendVerificationEmailDTO,
  ): Promise<ApiResult<GenericPublicAckDTO>> {
    return publicClient.POST('/api/v1/emails/verify/resend', {
      body: payload,
    });
  }

  static async verifyAddEmail(payload: VerifyEmailDTO): Promise<ApiResult<EmailChangeCompletedDTO>> {
    return publicClient.POST('/api/v1/emails/backup/change/complete', {
      body: payload,
    });
  }

  static async removeBackupEmail(): Promise<ApiResult<unknown>> {
    const result = await privateClient.DELETE('/api/v1/emails/backup');
    return result;
  }
}
