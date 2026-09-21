import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { Check, Plus, Search, X } from 'lucide-solid';
import { createMemo, For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import { listTags, type TagDTO } from '@/shared/taxonomy/public';
import { followTag, listFollowedTags, unfollowTag } from '@/features/follow/actions/follow.action.ts';
import { useI18n } from '@/features/follow/i18n';
import { withLocale } from '@/shared/i18n/core/solid';

function FollowedTags() {
  const { t } = useI18n();
  const [state, setState] = createStore({
    tags: [] as TagDTO[],
    following: new Set<string>(),
    query: '',
    loading: true,
    busy: null as string | null,
    error: '',
  });

  onMount(async () => {
    const [allTags, followed] = await Promise.all([listTags(), listFollowedTags()]);
    setState({
      tags: allTags.filter((tag) => tag.status === 'active'),
      following: new Set(followed.map((tag) => tag.slug)),
      loading: false,
    });
  });

  const filtered = createMemo(() => {
    const search = state.query.trim().toLowerCase();
    if (!search) return state.tags;
    return state.tags.filter((tag) => `${tag.name} ${tag.slug}`.toLowerCase().includes(search));
  });

  const toggle = async (tag: TagDTO) => {
    if (state.busy) return;
    const active = state.following.has(tag.slug);
    setState({ busy: tag.slug, error: '' });
    const ok = active ? await unfollowTag(tag.slug) : await followTag(tag.slug);
    if (ok) {
      const following = new Set(state.following);
      if (active) following.delete(tag.slug);
      else following.add(tag.slug);
      setState('following', following);
    } else {
      setState('error', t('follow.error'));
    }
    setState('busy', null);
  };

  return (
    <div class="grid gap-4">
      <div class="flex items-center gap-2 rounded-2xl border border-line bg-surface-elevated px-3 shadow-sm focus-within:border-action-border focus-within:ring-2 focus-within:ring-focus/30">
        <Search class="size-4 shrink-0 text-content-subtle" aria-hidden="true" />
        <input
          type="search"
          value={state.query}
          onInput={(event) => setState('query', event.currentTarget.value)}
          placeholder={t('follow.search')}
          aria-label={t('follow.search')}
          class="field-control min-h-11 min-w-0 flex-1 border-0 bg-transparent text-sm text-content outline-none"
        />
        <Show when={state.query}>
          <button
            type="button"
            onClick={() => setState('query', '')}
            aria-label={t('follow.clearSearch')} class="action action-ghost"
           
          >
            <X class="size-4" aria-hidden="true" />
          </button>
        </Show>
      </div>

      <Show when={!state.loading} fallback={<LoadingState>{t('follow.loading')}</LoadingState>}>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <For each={filtered()} fallback={<p class="text-muted">{t('follow.empty')}</p>}>
            {(tag) => {
              const active = () => state.following.has(tag.slug);
              return (
                <article class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface-elevated p-4 shadow-sm">
                  <div class="min-w-0">
                    <p class="text-strong truncate">
                      #{tag.name}
                    </p>
                    <p class="text-subtle truncate">
                      /{tag.slug}
                    </p>
                  </div>
                  <ToggleButton
                    type="button"
                    disabled={state.busy === tag.slug}
                    pressed={active()}
                    size="sm"
                    onClick={() => void toggle(tag)}
                  >
                    {active() ? (
                      <Check class="size-3.5" aria-hidden="true" />
                    ) : (
                      <Plus class="size-3.5" aria-hidden="true" />
                    )}
                    {active() ? t('follow.following') : t('follow.follow')}
                  </ToggleButton>
                </article>
              );
            }}
          </For>
        </div>
      </Show>
      <Show when={state.error}>
        <p role="alert" class="text-danger">
          {state.error}
        </p>
      </Show>
    </div>
  );
}

export default withLocale(FollowedTags);
