import { createSignal, onMount, Show } from 'solid-js';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useAccount } from '@/features/account/public/account-state';
import { isOAuthProvider } from '@/features/auth/ui/schemas/oauth-provider.schema.ts';
import { useI18n } from '@/features/auth/i18n';
import AuthenticationContinuation from '@/features/auth/ui/components/authentication-continuation.component.tsx';
import { authenticationOutcomeFromResult, type AuthenticationOutcome } from '@/features/auth/types';
import { sanitizeReturnTo, takeOAuthReturnTo } from '@/features/auth/utils/return-to.util.ts';
import { routes } from '@/shared/navigation/routes';
import { notifySessionAvailable } from '@/shared/api';
import type { Locale } from '@/shared/i18n/core';
interface Props {
  provider?: string;
  locale: Locale;
}

function OAuthCallback(props: Props) {
  const { t } = useI18n(props.locale);
  const { handleOAuthCallback } = useAuth();
  const { linkOAuthProvider } = useAccount();
  const [loading, setLoading] = createSignal(true);
  const [outcome, setOutcome] = createSignal<AuthenticationOutcome | null>(null);
  const [returnTo, setReturnTo] = createSignal<string>(routes.search);
  const [linkError, setLinkError] = createSignal<string | null>(null);

  const authenticated = () => {
    notifySessionAvailable();
    redirectTo(returnTo());
  };

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('flow') === 'link' ? 'link' : 'login';
    const providerMatch = window.location.pathname.match(/\/auth\/oauth\/([^/]+)\/callback/);
    const provider = props.provider ?? providerMatch?.[1];
    if (!provider || !isOAuthProvider(provider)) {
      setOutcome({ kind: 'error', message: t('oauth.invalidProvider') });
      setLoading(false);
      return;
    }

    const target = takeOAuthReturnTo(provider, flow);
    setReturnTo(String(sanitizeReturnTo(target)));
    if (params.get('error')) {
      if (flow === 'link') setLinkError(t('oauth.linkFailed'));
      else setOutcome({ kind: 'error', message: t('oauth.authFailed') });
      setLoading(false);
      return;
    }
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      if (flow === 'link') setLinkError(t('oauth.missingProof'));
      else setOutcome({ kind: 'error', message: t('oauth.missingProof') });
      setLoading(false);
      return;
    }
    if (flow === 'link') {
      const result = await linkOAuthProvider(provider, { code, stateToken: state });
      if (!result) {
        setLinkError(t('oauth.linkError'));
        setLoading(false);
        return;
      }
      redirectTo(returnTo());
      return;
    }
    const result = await handleOAuthCallback(provider, { code, state });
    const next = authenticationOutcomeFromResult(result);
    if (next.kind === 'authenticated') {
      authenticated();
      return;
    }
    setOutcome(next);
    setLoading(false);
  });

  return (
    <div class="space-y-4" aria-live="polite">
      <Show when={loading()}>
        <p class="text-muted">{t('oauth.finishing')}</p>
      </Show>
      <Show when={outcome()}>
        {(current) => (
          <AuthenticationContinuation
            outcome={current()}
            locale={props.locale}
            onChange={setOutcome}
            onAuthenticated={authenticated}
          />
        )}
      </Show>
      <Show when={linkError()}>
        <div class="space-y-3">
          <p role="alert" class="text-danger rounded-2xl border border-danger-border bg-danger-bg p-3">
            {linkError()}
          </p>
          <a
            class="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-content"
            href={routes.account.providers}
          >
            {t('oauth.backConnections')}
          </a>
        </div>
      </Show>
    </div>
  );
}

export default OAuthCallback;
