import { For, Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/organization/i18n';
import { useAuthSession } from '@/features/auth/public/session';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import { useOrganizationDetail } from '../hooks/use-organization-detail.hook.ts';
import type { Organization } from '@/features/organization/types/organization.type.ts';

function OrganizationDetail(props: { slug: string; initialOrganization?: Organization | null }) {
  const { t } = useI18n();
  const { authenticated } = useAuthSession();
  const detail = useOrganizationDetail(() => props.slug, props.initialOrganization);
  return (
    <Show
      when={!detail.loading()}
      fallback={<LoadingState>{t('organizationdetail.loadingOrganization')}</LoadingState>}
    >
      <Show
        when={!detail.failed() && detail.organization()}
        fallback={
          <RetryErrorState
            message={t('organizationdetail.organizationnotFound')}
            retryLabel={t('organizationdetail.loadingOrganization')}
            onRetry={() => void detail.load()}
          />
        }
      >
        {(org) => (
          <div class="space-y-8">
            <section class="rounded-2xl border border-line bg-surface p-6">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-accent-label">{org().type.replaceAll('_', ' ')}</p>
                  <h1 class="heading-strong-page mt-2">
                    {org().name}
                  </h1>
                  <p class="text-muted mt-3 max-w-3xl">
                    {org().description}
                  </p>
                </div>
                <a href={`/organizations/${encodeURIComponent(org().slug)}/settings`} class="action action-secondary">
                  {t('organizationdetail.manage')}
                </a>
              </div>
              <Show when={org().websiteUrl}>
                <a
                  class="mt-4 inline-block text-sm font-semibold text-content-accent"
                  href={org().websiteUrl!}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('organizationdetail.website')}
                </a>
              </Show>
            </section>
            <Show when={detail.jobs().length > 0}>
              <section>
                <h2 class="heading-card text-lg">
                  {t('organizationdetail.jobs')}
                </h2>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                  <For each={detail.jobs()}>
                    {(job) => (
                      <a
                        class="rounded-xl border border-line bg-surface p-4 text-sm font-semibold text-content transition duration-standard ease-standard hover:border-action-border"
                        href={`/jobs/${encodeURIComponent(job.id)}`}
                      >
                        {job.title}
                      </a>
                    )}
                  </For>
                </div>
              </section>
            </Show>
            <Show when={authenticated()}>
              <section>
                <h2 class="heading-card text-lg">
                  {t('organizationdetail.members')}
                </h2>
                <div class="mt-3 flex flex-wrap gap-2">
                  <For each={detail.members()}>
                    {(member) => (
                      <span class="rounded-full border border-line px-3 py-2 text-sm text-content-muted">
                        {member.displayName || member.username || member.accountId} · {member.role}
                      </span>
                    )}
                  </For>
                </div>
              </section>
            </Show>
          </div>
        )}
      </Show>
    </Show>
  );
}

export default withLocale(OrganizationDetail);
