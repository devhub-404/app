import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useAccount } from '@/features/account/public/account-state';
import { useI18n } from '@/features/auth/i18n';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { routes } from '@/shared/navigation/routes';
import { isOAuthProvider } from '@/features/auth/ui/schemas/oauth-provider.schema.ts';
import type { Locale } from '@/shared/i18n/core';
import { createSignal, onMount, Show } from 'solid-js';
type Props = { provider: string; locale: Locale };

function OAuthLinkCallback(props: Props) {
  const { t } = useI18n(props.locale);
  const { linkOAuthProvider } = useAccount();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(async () => {
    if (!props.provider || !isOAuthProvider(props.provider)) {
      setError(t('oauth.providerInvalid'));
      setLoading(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      setError(t('oauth.codeStateInvalid'));
      setLoading(false);
      return;
    }
    const result = await linkOAuthProvider(props.provider, { code, stateToken: state });
    if (result === false) {
      setError(resolveMessage('DEFAULT_ERROR', props.locale) || t('oauth.linkError'));
      setLoading(false);
      return;
    }
    redirectTo(`${routes.account.providers}?linked=${encodeURIComponent(props.provider)}`);
  });

  return (
    <Show when={!loading()} fallback={<p class="text-muted">{t('oauth.linking')}</p>}>
      <Show
        when={!error()}
        fallback={
          <p role="alert" class="text-danger">
            {error()}
          </p>
        }
      >
        <p class="text-muted">{t('oauth.redirecting')}</p>
      </Show>
    </Show>
  );
}

export default OAuthLinkCallback;
