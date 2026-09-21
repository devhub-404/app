import { ExternalLink, Pencil } from 'lucide-solid';
import { createMemo, createSignal, For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { listResourcesForManagement } from '@/features/resource/public';
import { routes } from '@/shared/navigation/routes';
import Select from '@/shared/ui/components/forms/select.component.tsx';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import SearchField from '@/shared/ui/components/forms/search-field.component.tsx';
import ManagementListItem from '@/shared/ui/components/surfaces/management-list-item.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
const tone: Record<string, 'success' | 'neutral'> = { active: 'success', archived: 'neutral' };

function ResourcesAdminList() {
  const { t } = useI18n();
  const label: Record<string, string> = {
    active: t('resourcesadminlist.active'),
    archived: t('resourcesadminlist.archived'),
  };
  type ManagementItem = Awaited<ReturnType<typeof listResourcesForManagement>>['items'][number];
  const [state, setState] = createStore({
    items: [] as ManagementItem[],
    loading: true,
  });
  const [query, setQuery] = createSignal('');
  const [status, setStatus] = createSignal('all');
  const listed = createMemo(() =>
    state.items.filter(
      (item) =>
        !item.deletedAt &&
        (status() === 'all' || item.status === status()) &&
        `${item.title} ${item.url} ${item.tags.map((tag) => tag.slug).join(' ')}`
          .toLowerCase()
          .includes(query().toLowerCase()),
    ),
  );
  onMount(() => {
    void (async () => {
      const result = await listResourcesForManagement();
      setState({ items: result.items, loading: false });
    })();
  });

  return (
    <ListPanel>
      <div class="flex flex-col gap-4 border-b border-line px-5 py-5 sm:px-6">
        <div>
          <p class="text-strong">{t('resourcemanagement.resources')}</p>
          <p class="text-muted mt-1">
            {t('resourcesadminlist.findResourceOpenReviewEditorial')}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <SearchField
            value={query()}
            onChange={setQuery}
            label={t('resourcesadminlist.searchResource')}
            placeholder={t('resourcesadminlist.searchResource')}
          />
          <div class="sm:w-48">
            <Select
              id="resource-admin-status"
              value={status()}
              options={[
                { value: 'all', label: t('resourcesadminlist.allStatuses') },
                ...Object.entries(label).map(([value, text]) => ({
                  value,
                  label: text,
                })),
              ]}
              onChange={setStatus}
            />
          </div>
        </div>
      </div>
      <Show when={!state.loading} fallback={<LoadingState>{t('resourcesadminlist.loadingResources')}</LoadingState>}>
        <ListPanelList>
          <For
            each={listed()}
            fallback={
              <li class="px-6 py-12 text-center">
                <p class="text-strong">{t('resourcesadminlist.noResourceFound')}</p>
                <p class="text-muted mt-2">
                  {t('resourcesadminlist.adjustFiltersOrCreateResourceEditorial')}
                </p>
                <div class="mt-5 flex justify-center">
                  <a href={routes.resourceNew} class="action action-primary">
                    {t('resourcesadminlist.createResource')}
                  </a>
                </div>
              </li>
            }
          >
            {(resource) => (
              <li>
                <ManagementListItem
                  status={
                    <StatusBadge status={tone[resource.status] ?? 'neutral'}>
                      {label[resource.status] ?? resource.status}
                    </StatusBadge>
                  }
                  meta={<span class="truncate text-xs text-content-muted">{resource.url}</span>}
                  title={resource.title}
                  description={
                    <p class="text-caption">
                      {resource.votes} {t('resourcesadminlist.votes')} {resource.tags.length}{' '}
                      {t('resourcesadminlist.tags')}
                    </p>
                  }
                  actions={
                    <div class="flex flex-wrap gap-2">
                      <a href={resource.url} target="_blank" rel="noreferrer" class="action action-secondary">
                        <ExternalLink class="size-3.5" /> {t('resourcesadminlist.source')}
                      </a>
                      <a href={routes.resourceEdit(resource.id)} class="action action-secondary">
                        <Pencil class="size-3.5" /> {t('newsadminlist.edit')}
                      </a>
                    </div>
                  }
                />
              </li>
            )}
          </For>
        </ListPanelList>
      </Show>
    </ListPanel>
  );
}

export default withLocale(ResourcesAdminList);
