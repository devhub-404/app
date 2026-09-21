import { For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { BriefcaseBusiness, Eye, Pencil } from 'lucide-solid';
import { listMyJobs } from '@/features/job/actions/job.action.ts';
import type { Job } from '@/features/job/types/job.type.ts';
import { canEditJob } from '@/features/job/access/job.access.ts';
import { isJobEditable } from '@/features/job/domain/job.domain.ts';
import { useJobActor } from '@/features/job/ui/hooks/use-job-actor.hook.ts';
import { routes } from '@/shared/navigation/routes';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { formatLocalizedDate } from '@/shared/i18n/core';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/job/i18n';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import ListPanelRows from '@/shared/ui/components/surfaces/list-panel-rows.component.tsx';
import ManagementListPanel from '@/shared/ui/components/surfaces/management-list-panel.component.tsx';
import ManagementListItem from '@/shared/ui/components/surfaces/management-list-item.component.tsx';
const statusTone: Record<Job['status'], 'success' | 'neutral' | 'warning' | 'danger'> = {
  published: 'success',
  closed: 'neutral',
  expired: 'warning',
  withdrawn: 'danger',
};

function JobManagement() {
  const { t, locale } = useI18n();
  const statusLabel: Record<Job['status'], string> = {
    published: t('jobmanagement.published'),
    closed: t('jobmanagement.closed'),
    expired: t('jobmanagement.expired'),
    withdrawn: t('jobmanagement.withdrawn'),
  };
  const [state, setState] = createStore({ items: [] as Job[], loading: true, error: '' });
  const { actor, loading: actorLoading } = useJobActor();

  const load = async () => {
    setState({ loading: true, error: '' });
    try {
      const result = await listMyJobs({ page: 1, pageSize: 100 });
      if (result.error) setState('error', t('jobmanagement.couldNotLoadOpportunitiesNow'));
      else setState('items', result.data?.data?.items ?? []);
    } catch {
      setState('error', t('jobmanagement.couldNotLoadOpportunitiesNow'));
    } finally {
      setState('loading', false);
    }
  };

  onMount(() => void load());

  return (
    <ManagementListPanel
      headingId="jobs-management-heading"
      title={t('jobmanagement.jobs')}
      description={t('jobmanagement.trackAvailabilityOpenManagementEachOpportunity')}
      action={
        <a href={routes.jobNew} class="action action-primary">
          <BriefcaseBusiness class="size-4" /> {t('jobactions.publishJob')}
        </a>
      }
      error={state.error}
      loading={state.loading}
      loadingLabel={t('jobmanagement.loadingJobs')}
    >
      <ListPanelRows>
        <For
          each={state.items}
          fallback={
            <EmptyState>
              <p class="text-emphasis">{t('jobmanagement.youStillNotPublishedJobs')}</p>
              <p class="text-muted-body mx-auto mt-2 max-w-md">
                {t('jobmanagement.createOpportunityReachProfessionalsCommunityRight')}
              </p>
              <div class="mt-5">
                <a href={routes.jobNew} class="action action-primary">
                  <BriefcaseBusiness class="size-4" /> {t('jobmanagement.publishFirstJob')}
                </a>
              </div>
            </EmptyState>
          }
        >
          {(job) => (
            <ManagementListItem
              status={<StatusBadge status={statusTone[job.status]}>{statusLabel[job.status]}</StatusBadge>}
              meta={
                <>
                  <span class="text-xs text-content-muted">
                    {t('jobmanagement.published')} {formatPublicDate(job.publishedAt, locale())}
                  </span>
                  <Show when={job.hiddenAt}>
                    <StatusBadge status="danger">{t('editjob.hiddenByModeration')}</StatusBadge>
                  </Show>
                </>
              }
              title={job.title}
              description={
                <p class="text-caption mt-2">
                  {t('jobmanagement.expires')} {formatLocalizedDate(job.expiresAt, locale())}
                </p>
              }
              actions={
                <>
                  <Show when={job.status === 'published' && !job.hiddenAt}>
                    <a href={routes.job(job.id)} class="action action-secondary">
                      <Eye class="size-3.5" /> {t('jobmanagement.view')}
                    </a>
                  </Show>
                  <Show when={!actorLoading() && canEditJob(job, actor()) && isJobEditable(job)}>
                    <a href={`${routes.account.jobs}/${job.id}`} class="action action-secondary">
                      <Pencil class="size-3.5" /> {t('jobmanagement.edit')}
                    </a>
                  </Show>
                </>
              }
            />
          )}
        </For>
      </ListPanelRows>
    </ManagementListPanel>
  );
}

export default withLocale(JobManagement);
