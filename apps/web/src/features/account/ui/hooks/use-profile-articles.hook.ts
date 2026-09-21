import { createSignal, onMount } from 'solid-js';
import { listArticlesQuery } from '@/features/article/public';
import type { ArticleItem } from '@/features/article/public';
import { useArticleInteractions } from '@/features/article/public';

type Props = {
  username: string;
  initialItems?: ArticleItem[];
  initialError?: boolean;
};

export function useProfileArticles(props: Props) {
  const [items, setItems] = createSignal<ArticleItem[]>(props.initialItems ?? []);
  const [loading, setLoading] = createSignal(props.initialItems === undefined);
  const [error, setError] = createSignal(Boolean(props.initialError));
  const interactions = useArticleInteractions(items);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await listArticlesQuery();
      const username = String(props.username ?? '')
        .trim()
        .toLowerCase();
      setItems(result.items.filter((item) => item.author?.username?.toLowerCase() === username));
      setError(Boolean(result.error));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    if (props.initialItems === undefined) void load();
  });

  return {
    items,
    loading,
    error,
    load,
    personal: interactions.personal,
    personalLoading: interactions.personalLoading,
    pending: interactions.pending,
    messages: interactions.messages,
    votesFor: interactions.votesFor,
    vote: interactions.vote,
    bookmark: interactions.bookmark,
    share: interactions.share,
  };
}
