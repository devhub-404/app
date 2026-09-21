import { For, Show, createResource } from 'solid-js';
import { listQuestionsForManagement } from '@/features/q-and-a/public';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';

function QuestionsAdminList() {
  const { t } = useI18n();
  const [result] = createResource(() => listQuestionsForManagement({ page: 1, pageSize: 30 }));
  const items = () => result()?.data?.data?.items ?? [];
  return (
    <ListPanel>
      <header class="border-b border-line px-5 py-5 sm:px-6">
        <h2 class="heading-callout text-sm">
          {t('admininventory.questions')}
        </h2>
        <p class="text-muted mt-1">
          {t('admininventory.connected')}
        </p>
      </header>
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
              {(question) => (
                <li class="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
                  <div class="min-w-0">
                    <a
                      class="truncate text-sm font-semibold text-content-accent hover:underline"
                      href={routes.question(question.id)}
                    >
                      {question.title}
                    </a>
                    <p class="text-caption mt-1">
                      {question.status}
                    </p>
                  </div>
                  <span class="text-xs font-semibold text-content-subtle">{question.status}</span>
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}
export default withLocale(QuestionsAdminList);
