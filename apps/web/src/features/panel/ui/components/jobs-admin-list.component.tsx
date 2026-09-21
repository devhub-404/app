import DestructiveConfirmation from '@/shared/ui/components/feedback/destructive-confirmation.component.tsx';
import { For, Show, createResource, createSignal } from 'solid-js';
import { Trash } from 'lucide-solid';
import { deleteJob, listJobsForManagement, type Job } from '@/features/job/public';
import type { ActorRole } from '@/features/auth/public';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';

function JobsAdminList(props: { role: ActorRole | null }) {
  const { t } = useI18n();
  const [result, { refetch }] = createResource(() => listJobsForManagement({ page: 1, pageSize: 30 }));
  const [deleting, setDeleting] = createSignal<Job | null>(null);
  const [busy, setBusy] = createSignal(false);
  const items = () => result()?.data?.data?.items ?? [];
  const remove = async () => {
    const item = deleting();
    if (!item || busy()) return;
    setBusy(true);
    const ok = await deleteJob(item.id);
    setBusy(false);
    if (ok) {
      setDeleting(null);
      void refetch();
    }
  };

  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading title={t('admininventory.jobs')} description={t('admininventory.connected')} />
      </ListPanelHeader>
      <Show when={!result.loading} fallback={<LoadingState>{t('admininventory.loading')}</LoadingState>}>
        <Show
          when={!result.error}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('admininventory.error')}
            </p>
          }
        >
          <ListPanelList>
            <For
              each={items()}
              fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('admininventory.empty')}</li>}
            >
              {(job) => (
                <li class="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
                  <div class="grid min-w-0 gap-1">
                    <a
                      class="truncate text-sm font-semibold text-content-accent hover:underline"
                      href={routes.job(job.id)}
                    >
                      {job.title}
                    </a>
                    <p class="text-caption">{job.status}</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span class="text-xs font-semibold text-content-subtle">{job.status}</span>
                    <Show when={props.role === 'admin'}>
                      <button type="button" onClick={() => setDeleting(job)} class="action action-danger-outline">
                        <Trash class="size-3.5" aria-hidden="true" />
                        {t('jobsadminlist.delete')}
                      </button>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>
      <Show when={deleting()}>
        {(job) => (
          <DestructiveConfirmation
            accessibleLabel={t('jobsadminlist.delete')}
            title={t('jobsadminlist.deleteTitle')}
            description={job().title}
            confirmLabel={t('jobsadminlist.delete')}
            cancelLabel={t('jobsadminlist.cancel')}
            busy={busy()}
            onConfirm={() => void remove()}
            onCancel={() => setDeleting(null)}
          />
        )}
      </Show>
    </ListPanel>
  );
}
export default withLocale(JobsAdminList);
