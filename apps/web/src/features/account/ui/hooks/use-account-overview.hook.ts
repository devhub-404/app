import { createMemo, createSignal, onMount } from 'solid-js';
import { useAccount } from './use-account.hook.ts';

export function useAccountOverview() {
  const { state, bootstrapAccount, refreshSessions } = useAccount();
  const [sessionsLoaded, setSessionsLoaded] = createSignal(false);
  const [sessionCount, setSessionCount] = createSignal(0);

  onMount(async () => {
    try {
      await bootstrapAccount();
      const result = await refreshSessions();
      if (result.ok) setSessionCount(result.items.length);
    } finally {
      setSessionsLoaded(true);
    }
  });

  const details = createMemo(() => state().details);
  const primaryEmailVerified = createMemo(() =>
    Boolean(details()?.emails.find((email) => email.type === 'primary')?.verifiedAt),
  );
  const mfaEnabled = createMemo(() => Boolean(details()?.account.mfaEnabled));

  return { details, primaryEmailVerified, mfaEnabled, sessionsLoaded, sessionCount };
}
