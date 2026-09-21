import { createSignal, onMount, Show } from 'solid-js';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import SuggestionList, { type SuggestionListItem } from './suggestion-list.component.tsx';
import SuggestionPanel from './suggestion-panel.component.tsx';

type Props = {
  title: string;
  description: string;
  refreshLabel: string;
  loadingLabel: string;
  errorMessage: string;
  retryLabel: string;
  emptyLabel: string;
  loadItems: () => Promise<SuggestionListItem[]>;
};

export default function SuggestionHistory(props: Props) {
  const [items, setItems] = createSignal<SuggestionListItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setItems(await props.loadItems());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => void load());

  return (
    <SuggestionPanel
      title={props.title}
      description={props.description}
      refreshLabel={props.refreshLabel}
      loading={loading()}
      onRefresh={() => void load()}
    >
      <Show when={!loading()} fallback={<LoadingState role="status">{props.loadingLabel}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <RetryErrorState message={props.errorMessage} retryLabel={props.retryLabel} onRetry={() => void load()} />
          }
        >
          <SuggestionList items={items()} empty={props.emptyLabel} />
        </Show>
      </Show>
    </SuggestionPanel>
  );
}
