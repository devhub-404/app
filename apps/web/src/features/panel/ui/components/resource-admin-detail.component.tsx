import { Archive, ArchiveRestore, Trash, X } from 'lucide-solid';
import { onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { ResourceItem, ResourceMutationResult } from '@/features/resource/public';
import {
  archiveResource,
  deleteResource,
  loadResourceForManagement,
  unarchiveResource,
} from '@/features/resource/public';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import Alert from '@/shared/ui/components/feedback/alert.component.tsx';
function ResourceAdminDetail(props: { id: string }) {
  const { t } = useI18n();
  const [state, setState] = createStore({
    loading: true,
    item: null as ResourceItem | null,
    error: '',
    busy: false,
    confirmDelete: false,
  });
  const reload = async () => setState('item', await loadResourceForManagement(props.id));
  const action = async (task: () => Promise<ResourceMutationResult>) => {
    if (state.busy) return;
    setState({ busy: true, error: '' });
    try {
      const result = await task();
      if (result.kind === 'failure') setState('error', t('resourceadmindetail.actionNotCanBeCompleted'));
      else {
        setState('confirmDelete', false);
        await reload();
      }
    } catch {
      setState('error', t('resourceadmindetail.actionNotCanBeCompleted'));
    } finally {
      setState('busy', false);
    }
  };
  onMount(async () => {
    setState('loading', true);
    try {
      await reload();
    } finally {
      setState('loading', false);
    }
  });
  return (
    <Surface variant="elevated" padding="sm" aria-busy={state.busy}>
      <Show when={!state.loading} fallback={<p class="text-muted">{t('resourceadmindetail.loading')}</p>}>
        <Show when={state.item} fallback={<p class="text-muted">{t('resourceadmindetail.resourcenotFound')}</p>}>
          {(resource) => (
            <div class="flex flex-col gap-2 text-sm text-content">
              <p class="text-strong">{resource().title}</p>
              <p class="text-caption">
                {t('resourceadmindetail.id')} {resource().id}
              </p>
              <p class="text-caption">
                {t('resourceadmindetail.status')} {resource().status}
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <Show when={resource().status === 'published'}>
                  <button
                    type="button"
                    disabled={state.busy}
                    onClick={() => void action(() => archiveResource(props.id))} class="action action-secondary"
                   
                  >
                    <Archive class="size-4" aria-hidden="true" />
                    {t('resourceadmindetail.archive')}
                  </button>
                </Show>
                <Show when={resource().status === 'archived'}>
                  <button
                    type="button"
                    disabled={state.busy}
                    onClick={() => void action(() => unarchiveResource(props.id))} class="action action-secondary"
                   
                  >
                    <ArchiveRestore class="size-4" aria-hidden="true" />
                    {t('resourceadmindetail.unarchive')}
                  </button>
                </Show>
                <Show when={!state.confirmDelete}>
                  <button
                    type="button"
                    disabled={state.busy}
                    onClick={() => setState('confirmDelete', true)} class="action action-danger-outline"
                   
                  >
                    <Trash class="size-4" aria-hidden="true" />
                    {t('resourceadmindetail.delete')}
                  </button>
                </Show>
              </div>
              <Show when={state.confirmDelete}>
                <Alert status="danger" class="mt-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-caption mr-auto">
                      {t('resourceadmindetail.deletePermanentlyThisResourcedoesNotExistRestoreAuthorial')}
                    </p>
                    <button
                      type="button"
                      disabled={state.busy}
                      onClick={() => void action(() => deleteResource(props.id))} class="action action-danger"
                     
                    >
                      <Trash class="size-4" aria-hidden="true" />
                      {t('resourceadmindetail.confirmDeletion')}
                    </button>
                    <button
                      type="button"
                      disabled={state.busy}
                      onClick={() => setState('confirmDelete', false)} class="action action-secondary"
                     
                    >
                      <X class="size-4" aria-hidden="true" />
                      {t('resourceadmindetail.cancel')}
                    </button>
                  </div>
                </Alert>
              </Show>
              <Show when={state.error}>
                <Alert status="danger" class="mt-2">
                  {state.error}
                </Alert>
              </Show>
            </div>
          )}
        </Show>
      </Show>
    </Surface>
  );
}

export default withLocale(ResourceAdminDetail);
