import { For, Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/organization/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import { useMyOrganizations } from '../hooks/use-my-organizations.hook.ts';
import { routes } from '@/shared/navigation/routes';

function MyOrganizations() {
  const { t } = useI18n();
  const organizations = useMyOrganizations();
  return (
    <Show when={!organizations.loading()} fallback={<LoadingState>{t('myorganizations.loading')}</LoadingState>}>
      <Show
        when={!organizations.failed()}
        fallback={
          <RetryErrorState
            message={t('myorganizations.youStillNotParticipatesOrganizations')}
            retryLabel={t('myorganizations.loading')}
            onRetry={() => void organizations.load()}
          />
        }
      >
        <Show
          when={organizations.items().length}
          fallback={
            <EmptyState>
              <p class="text-muted">{t('myorganizations.youStillNotParticipatesOrganizations')}</p>
            </EmptyState>
          }
        >
          <div class="space-y-3">
            <For each={organizations.items()}>
              {(item) => (
                <div class="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
                  <strong class="text-content">{item.name}</strong>
                  <a href={routes.organizationSettings(item.slug)} class="action action-secondary">
                    {t('myorganizations.manage')}
                  </a>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </Show>
  );
}

export default withLocale(MyOrganizations);
