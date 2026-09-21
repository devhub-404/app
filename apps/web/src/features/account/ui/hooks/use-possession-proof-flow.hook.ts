import { createStore } from 'solid-js/store';
import { useAuth } from '@/features/auth/public';
import type { ProtectedAccountActionResult } from '@/features/account/actions/account.action.ts';

type Pending = {
  run: () => Promise<ProtectedAccountActionResult>;
  after: (result: ProtectedAccountActionResult) => Promise<void> | void;
};

type PossessionProofState = {
  open: boolean;
  sent: boolean;
  mfaRequired: boolean;
  busy: boolean;
  error: string | null;
  pending: Pending | null;
};

export type PossessionProofInput = {
  code: string;
  method: 'totp' | 'recovery_code';
};

export function usePossessionProofFlow() {
  const { startPossessionProof, completePossessionProof } = useAuth();
  const [state, setState] = createStore<PossessionProofState>({
    open: false,
    sent: false,
    mfaRequired: false,
    busy: false,
    error: null,
    pending: null,
  });

  const execute = async (
    run: () => Promise<ProtectedAccountActionResult>,
    after: (result: ProtectedAccountActionResult) => Promise<void> | void,
  ) => {
    const result = await run();
    if (result.kind === 'proof-required') {
      setState({ pending: { run, after }, open: true, error: null });
      return result;
    }
    if (result.kind === 'success') await after(result);
    return result;
  };

  const request = async () => {
    if (state.busy) return;
    setState({ busy: true, error: null });
    try {
      const result = await startPossessionProof();
      const data = (result as typeof result & { data?: { data?: { sent?: boolean; mfaRequired?: true } } }).data?.data;
      if (result.error) setState('error', result.error.code ?? 'AUTH_REQUIRED');
      else if (data?.mfaRequired) setState({ mfaRequired: true, sent: false });
      else setState('sent', Boolean(data?.sent));
    } finally {
      setState('busy', false);
    }
  };

  const confirm = async (input: PossessionProofInput) => {
    if (state.busy) return;
    setState({ busy: true, error: null });
    try {
      const result = await completePossessionProof(
        state.mfaRequired ? { mfaMethod: input.method, mfaCode: input.code } : input.code,
      );
      if (
        result.error ||
        !(result as typeof result & { data?: { data?: { accepted?: boolean } } }).data?.data?.accepted
      ) {
        setState('error', result.error?.code ?? 'AUTH_REQUIRED');
        return;
      }
      const operation = state.pending;
      setState({
        pending: null,
        open: false,
        sent: false,
        mfaRequired: false,
      });
      if (operation) {
        const retried = await operation.run();
        if (retried.kind === 'success') await operation.after(retried);
      }
    } finally {
      setState('busy', false);
    }
  };

  const dismiss = () => {
    if (state.busy) return;
    setState({
      pending: null,
      open: false,
      sent: false,
      mfaRequired: false,
      error: null,
    });
  };

  return {
    open: () => state.open,
    sent: () => state.sent,
    mfaRequired: () => state.mfaRequired,
    busy: () => state.busy,
    error: () => state.error,
    execute,
    request,
    confirm,
    dismiss,
  };
}
