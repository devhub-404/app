import { For, Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/organization/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import { useOrganizationDirectory } from '../hooks/use-organization-directory.hook.ts';

function OrganizationDirectory() {
  const { t } = useI18n();
  const directory = useOrganizationDirectory();
  return (
    <div class="space-y-4">
      <div class="flex justify-end">
        <a href="/organizations/new" class="action action-primary">
          {t('organizationcreateform.createOrganization')}
        </a>
      </div>
      <Show
        when={!directory.loading()}
        fallback={<LoadingState>{t('organizationdirectory.loadingOrganizations')}</LoadingState>}
      >
        <Show
          when={!directory.failed()}
          fallback={
            <RetryErrorState
              message={t('organizationdirectory.couldNotLoadOrganizations')}
              retryLabel={t('organizationdirectory.loadingOrganizations')}
              onRetry={() => void directory.load()}
            />
          }
        >
          <Show
            when={directory.items().length}
            fallback={
              <EmptyState>
                <p class="text-muted">{t('organizationdirectory.loadingOrganizations')}</p>
              </EmptyState>
            }
          >
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <For each={directory.items()}>
                {(item) => (
                  <a
                    href={`/organizations/${encodeURIComponent(item.slug)}`}
                    class="rounded-2xl border border-line bg-surface p-5 transition duration-standard ease-standard hover:border-action-border"
                  >
                    <p class="text-accent-label">{item.type.replaceAll('_', ' ')}</p>
                    <h2 class="heading-card mt-2 text-lg">
                      {item.name}
                    </h2>
                    <p class="text-muted mt-2 line-clamp-3">
                      {item.description}
                    </p>
                  </a>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
}

export default withLocale(OrganizationDirectory);
