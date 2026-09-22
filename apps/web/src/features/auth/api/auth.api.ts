import type { OAuthProvider } from '@/features/auth/types/auth.type.ts';
import type {
  ChangePasswordInput,
  LoginInput,
  LoginResult,
  OAuthFlow,
  RegisterInput,
  ResetPasswordInput,
} from '@/features/auth/types';
import { toLoginResult } from '@/features/auth/types';
import { privateClient } from '@/shared/api';
import { publicClient, type ApiResult } from '@/shared/api';
import { sanitizeReturnTo } from '@/features/auth/utils/return-to.util.ts';
import { loadOpaque, loadWebAuthn } from '@/features/auth/utils/browser-auth.util.ts';
import type {
  ForgotPasswordDTO,
  ResendVerificationEmailDTO,
  MfaTotpEnrollCompleteDTO,
  MfaTotpEnrollCompleteResponseDTO,
  MfaTotpEnrollStartDTO,
  MfaConfigurationDTO,
  MfaDisableDTO,
  GenericPublicAckDTO,
  AccountRecoveredDTO,
  PasswordRecoveryCompletedDTO,
  EmailVerifiedDTO,
  MfaRecoveryCodesDTO,
  OAuthAuthorizationDTO,
  PasskeyDeviceDTO,
  PasskeyRegisteredDTO,
  PasswordCredentialCreatedDTO,
  PasswordChangedDTO,
  PasswordRegistrationCompletedDTO,
  PossessionProofCompleteDTO,
  PossessionProofStartedDTO,
  PossessionProofRequirementResultDTO,
  PasswordLoginCompleteDTO,
  PasskeyLoginDTO,
  MagicLinkLoginDTO,
  OAuthLoginDTO,
  MfaRecoveryCodeSessionDTO,
  PasskeyChallengeDTO,
  PasswordRegisterStartResponseDTO,
  PasswordLoginStartResponseDTO,
  PasswordChangeStartResponseDTO,
  PasswordRecoverPrepareResponseDTO,
} from '@/features/auth/types/auth.type.ts';

function responseData<T>(response: { data?: { data?: T } }): T | undefined {
  return response.data?.data;
}

function mapAuthenticationResult<T extends import('../types/login-result.type.ts').AuthenticationTransportDTO>(
  result: ApiResult<T>,
): ApiResult<LoginResult> {
  return {
    ...result,
    data: result.data
      ? {
          ...result.data,
          data: toLoginResult(result.data.data),
        }
      : undefined,
  };
}

export class AuthApi {
  static async startOAuth(
    provider: OAuthProvider,
    flow: OAuthFlow = 'login',
  ): Promise<ApiResult<OAuthAuthorizationDTO>> {
    const client = flow === 'link' ? privateClient : publicClient;
    const path = flow === 'link' ? '/api/v1/oauth/{provider}/link/start' : '/api/v1/oauth/{provider}/login/start';
    return client.POST(path, {
      params: { path: { provider } },
      credentials: 'include',
    });
  }

  static async handleOAuthCallback(
    provider: OAuthProvider,
    params: { code: string; state: string },
  ): Promise<ApiResult<LoginResult>> {
    const result: ApiResult<OAuthLoginDTO> = await publicClient.POST('/api/v1/oauth/{provider}/login/complete', {
      params: { path: { provider } },
      body: { code: params.code, stateToken: params.state },
      credentials: 'include',
    });
    return mapAuthenticationResult(result);
  }

  static async register(payload: RegisterInput): Promise<ApiResult<PasswordRegistrationCompletedDTO>> {
    const { client: opaqueClient, ready: opaqueReady } = await loadOpaque();
    await opaqueReady;
    const started = opaqueClient.startRegistration({
      password: payload.password,
    });
    const response = await publicClient.POST('/api/v1/register/password/start', {
      body: {
        email: payload.email,
        registrationRequest: started.registrationRequest,
      },
    });
    const registrationData = responseData<PasswordRegisterStartResponseDTO>(response);
    const registrationResponse = registrationData?.registrationResponse;
    const opaqueUserIdentifier = registrationData?.opaqueUserIdentifier;
    if (response.error || !registrationResponse || !opaqueUserIdentifier) return response;

    const finished = opaqueClient.finishRegistration({
      password: payload.password,
      registrationResponse,
      clientRegistrationState: started.clientRegistrationState,
    });
    const result = await publicClient.POST('/api/v1/register/password/complete', {
      body: {
        email: payload.email,
        registrationRecord: finished.registrationRecord,
        opaqueUserIdentifier,
      },
    });
    return result;
  }

  static async login(payload: LoginInput): Promise<ApiResult<LoginResult>> {
    const { client: opaqueClient, ready: opaqueReady } = await loadOpaque();
    await opaqueReady;
    const started = opaqueClient.startLogin({ password: payload.password });
    const response = await publicClient.POST('/api/v1/login/password/start', {
      body: {
        email: payload.email,
        startLoginRequest: started.startLoginRequest,
      },
    });
    const loginData = responseData<PasswordLoginStartResponseDTO>(response);
    if (response.error || !loginData) return response;

    const finished = opaqueClient.finishLogin({
      password: payload.password,
      loginResponse: loginData.loginResponse,
      clientLoginState: started.clientLoginState,
    });
    if (!finished)
      return {
        error: {
          code: 'AUTH_INVALID_CREDENTIAL',
          message: 'AUTH_INVALID_CREDENTIAL',
        },
      };

    const result: ApiResult<PasswordLoginCompleteDTO> = await publicClient.POST('/api/v1/login/password/complete', {
      body: {
        email: payload.email,
        serverLoginState: loginData.serverLoginState,
        finishLoginRequest: finished.finishLoginRequest,
      },
      credentials: 'include',
    });
    return mapAuthenticationResult(result);
  }

  static async verifyMfaTotp(token: string, code: string): Promise<ApiResult<null>> {
    const result: ApiResult<null> = await publicClient.POST('/api/v1/mfa/verify/totp', {
      body: { token, code },
      credentials: 'include',
    });
    return result;
  }

  static async verifyMfaRecoveryCode(token: string, recoveryCode: string): Promise<ApiResult<LoginResult>> {
    const result: ApiResult<MfaRecoveryCodeSessionDTO> = await publicClient.POST('/api/v1/mfa/verify/recovery-code', {
      body: { token, recoveryCode },
      credentials: 'include',
    });
    return mapAuthenticationResult(result);
  }

  static async startTotpEnrollment(): Promise<ApiResult<MfaTotpEnrollStartDTO>> {
    const result = await privateClient.POST('/api/v1/mfa/enroll/totp/start');
    return result;
  }

  static async getMfaConfiguration(): Promise<ApiResult<MfaConfigurationDTO>> {
    const result = await privateClient.GET('/api/v1/mfa/configuration');
    return result;
  }

  static async startPossessionProof(): Promise<ApiResult<PossessionProofStartedDTO>> {
    const result = await privateClient.POST('/api/v1/possession-proof/start');
    return result;
  }

  static async completePossessionProof(
    payload: PossessionProofCompleteDTO,
  ): Promise<ApiResult<PossessionProofRequirementResultDTO>> {
    const result = await privateClient.POST('/api/v1/possession-proof/complete', {
      body: payload,
    });
    return result;
  }

  static async completeTotpEnrollment(
    payload: MfaTotpEnrollCompleteDTO,
  ): Promise<ApiResult<MfaTotpEnrollCompleteResponseDTO>> {
    const result = await privateClient.POST('/api/v1/mfa/enroll/totp/complete', {
      body: payload,
      credentials: 'include',
    });
    return result;
  }

  static async disableTotp(proof: MfaDisableDTO): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/mfa/totp/disable', { body: proof });
    return result;
  }

  static async regenerateRecoveryCodes(): Promise<ApiResult<MfaRecoveryCodesDTO>> {
    const result = await privateClient.POST('/api/v1/mfa/recovery-codes/regenerate');
    return result;
  }

  static async listPasskeyDevices(): Promise<ApiResult<PasskeyDeviceDTO[]>> {
    const result = await privateClient.GET('/api/v1/credentials/passkeys');
    return result;
  }

  static async registerPasskey(deviceName?: string): Promise<ApiResult<PasskeyRegisteredDTO>> {
    const { startRegistration } = await loadWebAuthn();
    const started = await privateClient.POST('/api/v1/register/passkey/start');
    const challenge = responseData<PasskeyChallengeDTO>(started);
    if (!challenge) return started;

    let response: unknown;
    try {
      response = await startRegistration({
        optionsJSON: challenge.options as unknown as Parameters<typeof startRegistration>[0]['optionsJSON'],
      });
    } catch (error) {
      return {
        error: {
          code:
            error instanceof DOMException && error.name === 'NotAllowedError'
              ? 'PASSKEY_REGISTRATION_CANCELLED'
              : 'PASSKEY_REGISTRATION_FAILED',
          message: 'PASSKEY_REGISTRATION_FAILED',
        },
      };
    }

    const result = await privateClient.POST('/api/v1/register/passkey/complete', {
      body: {
        stateToken: challenge.stateToken,
        response: response as Record<string, unknown>,
        deviceName: deviceName || undefined,
      },
    });
    return result;
  }

  static async loginPasskey(): Promise<ApiResult<LoginResult>> {
    const { startAuthentication } = await loadWebAuthn();
    const started = await publicClient.POST('/api/v1/login/passkey/start');
    const challenge = responseData<PasskeyChallengeDTO>(started);
    if (!challenge) return started;
    let response: unknown;
    try {
      response = await startAuthentication({
        optionsJSON: challenge.options as unknown as Parameters<typeof startAuthentication>[0]['optionsJSON'],
      });
    } catch (error) {
      return {
        error: {
          code:
            error instanceof DOMException && error.name === 'NotAllowedError'
              ? 'PASSKEY_LOGIN_CANCELLED'
              : 'PASSKEY_LOGIN_FAILED',
          message: 'PASSKEY_LOGIN_FAILED',
        },
      };
    }
    const result: ApiResult<PasskeyLoginDTO> = await publicClient.POST('/api/v1/login/passkey/complete', {
      body: {
        stateToken: challenge.stateToken,
        response: response as Record<string, unknown>,
      },
      credentials: 'include',
    });
    return mapAuthenticationResult(result);
  }

  static async updatePasskeyDeviceName(credentialId: string, deviceName: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.PATCH('/api/v1/credentials/passkeys/{credentialId}', {
      params: { path: { credentialId } },
      body: { deviceName },
    });
    return result;
  }

  static async deleteCredential(credentialId: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.DELETE('/api/v1/credentials/{credentialId}', {
      params: { path: { credentialId } },
    });
    return result;
  }

  static async requestMagicLink(email: string, redirect?: string): Promise<ApiResult<GenericPublicAckDTO>> {
    const result = await publicClient.POST('/api/v1/login/magic-link/start', {
      body: { email, redirect: sanitizeReturnTo(redirect) },
    });
    return result;
  }

  static async completeMagicLink(token: string): Promise<ApiResult<LoginResult>> {
    const result: ApiResult<MagicLinkLoginDTO> = await publicClient.POST('/api/v1/login/magic-link/complete', {
      body: { token },
      credentials: 'include',
    });
    return mapAuthenticationResult(result);
  }

  static async createPasswordCredential(password: string): Promise<ApiResult<PasswordCredentialCreatedDTO>> {
    const { client: opaqueClient, ready: opaqueReady } = await loadOpaque();
    await opaqueReady;
    const registration = opaqueClient.startRegistration({ password });
    const started = await privateClient.POST('/api/v1/credentials/password/start', {
      body: { registrationRequest: registration.registrationRequest },
    });
    const registrationData = responseData<PasswordRegisterStartResponseDTO>(started);
    const registrationResponse = registrationData?.registrationResponse;
    const opaqueUserIdentifier = registrationData?.opaqueUserIdentifier;
    if (started.error || !registrationResponse || !opaqueUserIdentifier) return started;
    const finished = opaqueClient.finishRegistration({
      password,
      registrationResponse,
      clientRegistrationState: registration.clientRegistrationState,
    });
    return privateClient.POST('/api/v1/credentials/password/complete', {
      body: {
        registrationRecord: finished.registrationRecord,
        opaqueUserIdentifier,
      },
    });
  }

  static async changePassword(payload: ChangePasswordInput): Promise<ApiResult<PasswordChangedDTO>> {
    const { client: opaqueClient, ready: opaqueReady } = await loadOpaque();
    await opaqueReady;
    const login = opaqueClient.startLogin({
      password: payload.currentPassword,
    });
    const loginStart = await publicClient.POST('/api/v1/login/password/start', {
      body: {
        email: payload.email,
        startLoginRequest: login.startLoginRequest,
      },
    });
    const loginData = responseData<PasswordLoginStartResponseDTO>(loginStart);
    if (loginStart.error || !loginData) return loginStart;
    const verified = opaqueClient.finishLogin({
      password: payload.currentPassword,
      loginResponse: loginData.loginResponse,
      clientLoginState: login.clientLoginState,
    });
    if (!verified)
      return {
        error: {
          code: 'AUTH_INVALID_CREDENTIAL',
          message: 'AUTH_INVALID_CREDENTIAL',
        },
      };
    const registration = opaqueClient.startRegistration({
      password: payload.newPassword,
    });
    const changeStart = await privateClient.POST('/api/v1/change/password/start', {
      body: {
        serverLoginState: loginData.serverLoginState,
        finishLoginRequest: verified.finishLoginRequest,
        registrationRequest: registration.registrationRequest,
      },
    });
    const changeData = responseData<PasswordChangeStartResponseDTO>(changeStart);
    if (changeStart.error || !changeData) return changeStart;
    const finished = opaqueClient.finishRegistration({
      password: payload.newPassword,
      registrationResponse: changeData.registrationResponse,
      clientRegistrationState: registration.clientRegistrationState,
    });
    return privateClient.POST('/api/v1/change/password/complete', {
      body: {
        changeToken: changeData.changeToken,
        registrationRecord: finished.registrationRecord,
      },
    });
  }

  static async startAccountRecovery(email: string): Promise<ApiResult<GenericPublicAckDTO>> {
    return publicClient.POST('/api/v1/account-recovery/start', {
      body: { email },
    });
  }

  static async completeAccountRecovery(payload: { token: string }): Promise<ApiResult<AccountRecoveredDTO>> {
    return publicClient.POST('/api/v1/account-recovery/complete', {
      body: { token: payload.token },
    });
  }

  static async requestPasswordReset(payload: ForgotPasswordDTO): Promise<ApiResult<GenericPublicAckDTO>> {
    const result = await publicClient.POST('/api/v1/recover/password/start', {
      body: payload,
    });
    return result;
  }

  static async resetPassword(payload: ResetPasswordInput): Promise<ApiResult<PasswordRecoveryCompletedDTO>> {
    const { client: opaqueClient, ready: opaqueReady } = await loadOpaque();
    await opaqueReady;
    const registration = opaqueClient.startRegistration({
      password: payload.password,
    });
    const prepared = await publicClient.POST('/api/v1/recover/password/prepare', {
      body: {
        token: payload.token,
        registrationRequest: registration.registrationRequest,
      },
    });
    const response = responseData<PasswordRecoverPrepareResponseDTO>(prepared);
    if (prepared.error || !response) return prepared;
    const finished = opaqueClient.finishRegistration({
      password: payload.password,
      registrationResponse: response.registrationResponse,
      clientRegistrationState: registration.clientRegistrationState,
    });
    const result = await publicClient.POST('/api/v1/recover/password/complete', {
      body: {
        token: payload.token,
        registrationRecord: finished.registrationRecord,
      },
    });
    return result;
  }

  static async verifyEmail(token: string): Promise<ApiResult<EmailVerifiedDTO>> {
    const result = await publicClient.POST('/api/v1/emails/verify/complete', {
      body: { token },
    });
    return result;
  }

  static async resendVerification(_payload: ResendVerificationEmailDTO): Promise<ApiResult<GenericPublicAckDTO>> {
    const result = await publicClient.POST('/api/v1/emails/verify/resend', {
      body: _payload,
    });
    return result;
  }
}
