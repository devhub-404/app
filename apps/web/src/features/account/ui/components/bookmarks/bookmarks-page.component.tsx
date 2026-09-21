import Alert from '@/shared/ui/components/feedback/alert.component.tsx';
import { getPersonalBookmarks, refreshPersonalState } from '@/shared/runtime/personal-state';
import { removeBookmark } from '@/shared/interactions/bookmark/public';
import type { BookmarkDTO } from '@/shared/interactions/bookmark/types/bookmark.type.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import ListPanelRows from '@/shared/ui/components/surfaces/list-panel-rows.component.tsx';
import { createSignal, For, onMount, Show } from 'solid-js';
import { Trash } from 'lucide-solid';
function BookmarksPage() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<BookmarkDTO[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);

  onMount(async () => {
    const result = await getPersonalBookmarks();
    if (result) setItems(result.filter((item) => item.active));
    else setError(true);
    setLoading(false);
  });

  const remove = async (item: BookmarkDTO) => {
    const previous = items();
    setItems(previous.filter((current) => current.resourceId !== item.resourceId));
    const result = await removeBookmark(item.resourceId);
    if (result.error) setItems(previous);
    else void refreshPersonalState();
  };

  return (
    <ListPanel aria-labelledby="bookmarks-heading">
      <div class="border-b border-line px-5 py-5 sm:px-6">
        <p id="bookmarks-heading" class="text-strong">
          {t('bookmarks.bookmarks')}
        </p>
        <p class="text-muted mt-1">
          {t('bookmarks.libraryPersonalReferencesSaved')}
        </p>
      </div>
      <Show when={!loading()} fallback={<LoadingState role="status">{t('bookmarks.loadingBookmarks')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <Alert status="danger" class="m-6">
              {t('bookmarks.couldNotLoadBookmarks')}
            </Alert>
          }
        >
          <ListPanelRows>
            <For
              each={items()}
              fallback={
                <EmptyState>
                  <p class="text-body">{t('bookmarks.libraryThisEmpty')}</p>
                  <p class="text-muted mt-1">
                    {t('bookmarks.savedPublicReferencesAppearHere')}
                  </p>
                </EmptyState>
              }
            >
              {(item) => (
                <article class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div class="min-w-0">
                    <span class="text-xs font-semibold uppercase tracking-[0.16em] text-content-accent">
                      {t('bookmarks.typeResource')}
                    </span>
                    <p class="text-muted mt-2 break-all">
                      {t('bookmarks.reference')} {item.resourceId}
                    </p>
                  </div>
                  <button type="button" onClick={() => void remove(item)} class="action action-danger-outline">
                    <Trash class="size-4" aria-hidden="true" />
                    {t('bookmarks.remove')}
                  </button>
                </article>
              )}
            </For>
          </ListPanelRows>
        </Show>
      </Show>
    </ListPanel>
  );
}

export default withLocale(BookmarksPage);
