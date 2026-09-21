import { AccountLifecycleApi } from '../api/account-lifecycle.api.ts';

export type AccountReactivationResult =
  { kind: 'success' } | { kind: 'mfa-required'; token: string; methods: string[] } | { kind: 'failure'; code?: string };

export async function reactivateAccount(token: string): Promise<AccountReactivationResult> {
  try {
    const { data, error } = await AccountLifecycleApi.reactivate(token);
    if (error) return { kind: 'failure', code: error.code };

    const challenge = data?.data;
    if (challenge?.mfaRequired && challenge.token) {
      return {
        kind: 'mfa-required',
        token: challenge.token,
        methods: challenge.methods ?? [],
      };
    }

    return { kind: 'success' };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

export async function cancelAccountDeletion(
  token: string,
): Promise<{ kind: 'success' } | { kind: 'failure'; code?: string }> {
  try {
    const { error } = await AccountLifecycleApi.cancelDeletion(token);
    return error ? { kind: 'failure', code: error.code } : { kind: 'success' };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}
