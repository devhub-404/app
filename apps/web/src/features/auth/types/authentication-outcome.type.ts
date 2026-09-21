import type { LoginResult } from '@/features/auth/types/login-result.type.ts';
import type { ApiResult } from '@/shared/api';

export type AuthenticationOutcome =
  | { kind: 'authenticated'; redirect?: string | null }
  | { kind: 'mfa'; token: string; methods: string[]; redirect?: string | null }
  | { kind: 'reactivation'; token: string; redirect?: string | null }
  | { kind: 'restore-requested' }
  | { kind: 'email-verification-requested' }
  | { kind: 'error'; code?: string; message?: string };

export function authenticationOutcomeFromResult(
  result: ApiResult<LoginResult> | null | undefined,
): AuthenticationOutcome {
  if (!result) return { kind: 'error' };
  if (result.error) {
    return {
      kind: 'error',
      code: result.error.code,
      message: result.error.message,
    };
  }

  const data = result.data?.data;
  if (!data) return { kind: 'error' };
  if (data.restoreAccessRequested) return { kind: 'restore-requested' };
  if (data.emailVerificationRequested) return { kind: 'email-verification-requested' };
  if (data.reactivationToken) {
    return {
      kind: 'reactivation',
      token: data.reactivationToken,
      redirect: data.redirect,
    };
  }
  if (data.mfaRequired && data.token) {
    return {
      kind: 'mfa',
      token: data.token,
      methods: data.methods ?? [],
      redirect: data.redirect,
    };
  }
  return { kind: 'authenticated', redirect: data.redirect };
}
