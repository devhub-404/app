import { For, Show, createResource } from 'solid-js';
import { listFeedbackForManagement, updateFeedbackStatus } from '@/features/feedback/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';

const statuses = ['open', 'in_review', 'resolved', 'dismissed'] as const;
type FeedbackStatus = (typeof statuses)[number];
const isFeedbackStatus = (value: string): value is FeedbackStatus => statuses.some((status) => status === value);

function FeedbackAdminList() {
  const { t } = useI18n();
  const [items, { refetch }] = createResource(async () => {
    const result = await listFeedbackForManagement({ page: 1, pageSize: 30 });
    return result.data?.data?.items ?? [];
  });
  const changeStatus = async (id: string, status: string) => {
    if (!isFeedbackStatus(status)) return;
    await updateFeedbackStatus(id, { status });
    await refetch();
  };
  return (
    <ListPanel>
      <header class="border-b border-line px-5 py-5 sm:px-6">
        <h2 class="heading-callout text-sm">
          {t('admininventory.feedback')}
        </h2>
        <p class="text-muted mt-1">
          {t('admininventory.connected')}
        </p>
      </header>
      <Show when={!items.loading} fallback={<LoadingState>{t('admininventory.loading')}</LoadingState>}>
        <Show
          when={!items.error}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('admininventory.error')}
            </p>
          }
        >
          <ListPanelList>
            <For
              each={items() ?? []}
              fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('admininventory.empty')}</li>}
            >
              {(feedback) => (
                <li class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div class="min-w-0">
                    <p class="text-strong">{feedback.description}</p>
                    <p class="text-caption mt-1">
                      {feedback.category} · {feedback.status}
                    </p>
                  </div>
                  <Select<FeedbackStatus>
                    id={`feedback-status-${feedback.id}`}
                    label={t('admininventory.status')}
                    value={feedback.status}
                    options={statuses.map((status) => ({ value: status, label: status }))}
                    onChange={(status) => void changeStatus(feedback.id, status)}
                  />
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}
export default withLocale(FeedbackAdminList);
