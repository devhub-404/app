import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import { createSignal, onMount, Show } from 'solid-js';
import { cancelAccountDeletion } from '@/features/account/actions/account-lifecycle.action.ts';
import { useI18n } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';
import { routes } from '@/shared/navigation/routes';
function AccountDeletionCancel(props: { token: string; locale: Locale }) {
  const { t } = useI18n(props.locale);
  const [state, setState] = createSignal<'loading' | 'success' | 'error'>('loading');

  onMount(() => {
    void (async () => {
      if (!props.token) {
        setState('error');
        return;
      }
      const result = await cancelAccountDeletion(props.token);
      setState(result.kind === 'success' ? 'success' : 'error');
    })();
  });

  return (
    <Surface variant="elevated" padding="lg" aria-live="polite" aria-busy={state() === 'loading'}>
      <Show when={state() === 'loading'}>
        <p class="text-muted">{t('lifecycle.deletionLoading')}</p>
      </Show>
      <Show when={state() === 'success'}>
        <div class="space-y-4">
          <h1 class="heading-form-page">
            {t('lifecycle.deletionTitle')}
          </h1>
          <p class="text-muted">{t('lifecycle.deletionBody')}</p>
          <a href={routes.auth.signIn} class="action action-primary">
            {t('lifecycle.login')}
          </a>
        </div>
      </Show>
      <Show when={state() === 'error'}>
        <div class="space-y-4" role="alert">
          <h1 class="heading-form-page">
            {t('lifecycle.deletionErrorTitle')}
          </h1>
          <p class="text-muted">{t('lifecycle.deletionErrorBody')}</p>
          <a href={routes.auth.signIn} class="action action-secondary">
            {t('lifecycle.login')}
          </a>
        </div>
      </Show>
    </Surface>
  );
}

export default AccountDeletionCancel;
