import { AuthApi } from '../api/auth.api.ts';
import type { ApiResult } from '@/shared/api';
import { rememberOAuthReturnTo } from '@/features/auth/utils/return-to.util.ts';
import { routes } from '@/shared/navigation/routes';
import { authCoordinator } from '@/features/auth/runtime/auth-runtime';
import { authenticationOutcomeFromResult } from '../types/authentication-outcome.type.ts';

export type AuthCommandResult = { ok: true; code?: string | null } | { ok: false; code: string };

const networkFailure = <T>(): ApiResult<T> => ({
  error: { code: 'NETWORK_REQUEST_FAILED', message: 'NETWORK_REQUEST_FAILED' },
});

async function request<T>(operation: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> {
  try {
    return await operation();
  } catch {
    return networkFailure<T>();
  }
}

async function command(operation: () => Promise<ApiResult<unknown>>): Promise<AuthCommandResult> {
  const result = await request(operation);
  if (result.error) return { ok: false, code: result.error.code ?? 'NETWORK_REQUEST_FAILED' };
  return { ok: true, code: result.data?.code };
}

function completesAuthentication(result: ApiResult<unknown>): boolean {
  return authenticationOutcomeFromResult(result as ApiResult<import("../types/login-result.type.ts").LoginResult>).kind ===
    "authenticated";
}

async function establishSession<T>(
  result: ApiResult<T>,
  options: { force?: boolean } = {},
): Promise<ApiResult<T>> {
  if (options.force || completesAuthentication(result as ApiResult<unknown>))
    await authCoordinator.establish();
  return result;
}

export const register = (payload: Parameters<typeof AuthApi.register>[0]) => command(() => AuthApi.register(payload));

export const login = async (payload: Parameters<typeof AuthApi.login>[0]) =>
  establishSession(await request(() => AuthApi.login(payload)));

export const loginPasskey = async () => establishSession(await request(() => AuthApi.loginPasskey()));

export const verifyMfaTotp = async (token: string, code: string) =>
  establishSession(await request(() => AuthApi.verifyMfaTotp(token, code)), { force: true });

export const verifyMfaRecoveryCode = async (token: string, recoveryCode: string) =>
  establishSession(await request(() => AuthApi.verifyMfaRecoveryCode(token, recoveryCode)));

export const startTotpEnrollment = () => request(() => AuthApi.startTotpEnrollment());

export const getMfaConfiguration = () => request(() => AuthApi.getMfaConfiguration());

export const startPossessionProof = () => request(() => AuthApi.startPossessionProof());

export const completePossessionProof = (proof: string | { mfaMethod: 'totp' | 'recovery_code'; mfaCode: string }) =>
  request(() => AuthApi.completePossessionProof(typeof proof === 'string' ? { emailCode: proof } : proof));

export const completeTotpEnrollment = (payload: Parameters<typeof AuthApi.completeTotpEnrollment>[0]) =>
  request(() => AuthApi.completeTotpEnrollment(payload));

export const disableTotp = (proof: Parameters<typeof AuthApi.disableTotp>[0]) =>
  command(() => AuthApi.disableTotp(proof));

export const regenerateRecoveryCodes = () => request(() => AuthApi.regenerateRecoveryCodes());

export const listPasskeyDevices = () => request(() => AuthApi.listPasskeyDevices());

export const registerPasskey = (deviceName?: string) => request(() => AuthApi.registerPasskey(deviceName));

export const updatePasskeyDeviceName = (id: string, deviceName: string) =>
  command(() => AuthApi.updatePasskeyDeviceName(id, deviceName));

export const deleteCredential = (id: string) => command(() => AuthApi.deleteCredential(id));

export const requestMagicLink = (email: string, redirect?: string) =>
  request(() => AuthApi.requestMagicLink(email, redirect));

export const completeMagicLink = async (token: string) =>
  establishSession(await request(() => AuthApi.completeMagicLink(token)));

export const startAccountRecovery = (email: string) => command(() => AuthApi.startAccountRecovery(email));

export const completeAccountRecovery = (payload: Parameters<typeof AuthApi.completeAccountRecovery>[0]) =>
  command(() => AuthApi.completeAccountRecovery(payload));

export const requestPasswordReset = (payload: Parameters<typeof AuthApi.requestPasswordReset>[0]) =>
  command(() => AuthApi.requestPasswordReset(payload));

export const resetPassword = (payload: Parameters<typeof AuthApi.resetPassword>[0]) =>
  command(() => AuthApi.resetPassword(payload));

export const createPasswordCredential = (password: string) => command(() => AuthApi.createPasswordCredential(password));

export const changePassword = (payload: Parameters<typeof AuthApi.changePassword>[0]) =>
  command(() => AuthApi.changePassword(payload));

export const verifyEmail = (token: string) => command(() => AuthApi.verifyEmail(token));

export const resendVerification = (payload: Parameters<typeof AuthApi.resendVerification>[0]) =>
  command(() => AuthApi.resendVerification(payload));

export const handleOAuthCallback = async (
  provider: Parameters<typeof AuthApi.handleOAuthCallback>[0],
  params: Parameters<typeof AuthApi.handleOAuthCallback>[1],
) => {
  return establishSession(await request(() => AuthApi.handleOAuthCallback(provider, params)));
};

export async function startOAuth(
  provider: Parameters<typeof AuthApi.startOAuth>[0],
  options?: { redirect?: string; flow?: 'login' | 'link' },
) {
  const flow = options?.flow ?? 'login';
  const result = await request(() => AuthApi.startOAuth(provider, flow));
  if (!result.error && result.data?.data?.url) {
    rememberOAuthReturnTo(
      provider,
      flow,
      options?.redirect ?? (flow === 'link' ? routes.account.providers : routes.feed),
    );
  }
  return result;
}
