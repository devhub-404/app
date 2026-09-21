import { createEffect, createMemo, createSignal } from 'solid-js';
import { useAccount } from '@/features/account/ui/hooks/use-account.hook.ts';

export function useSettingsAccount() {
  const account = useAccount();
  const [failed, setFailed] = createSignal(false);

  createEffect(() => {
    const current = account.state();
    if (current.status === 'idle') {
      void account.bootstrapAccount().catch(() => setFailed(true));
      return;
    }
    if (current.status === 'loading') return;
    setFailed(!current.details);
  });

  const loading = createMemo(() => {
    const current = account.state();
    return current.status === 'idle' || current.status === 'loading';
  });
  const emails = createMemo(() => account.state().details?.emails ?? []);

  return {
    ...account,
    loading,
    failed,
    emails,
  };
}
