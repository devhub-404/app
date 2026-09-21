import { createStore } from 'solid-js/store';

type PageResult<Item> = {
  items: Item[];
  total: number;
  error: boolean;
};

type Options<Item, Query extends { page: number }> = {
  initial: PageResult<Item>;
  initialPage: number;
  initialResolved?: boolean;
  getKey: (item: Item) => string;
  loadPage: (query: Query, signal?: AbortSignal) => Promise<PageResult<Item>>;
};

export function createInfiniteListing<Item, Query extends { page: number }>(options: Options<Item, Query>) {
  const [state, setState] = createStore({
    items: options.initial.items,
    total: options.initial.total,
    error: options.initial.error,
    loading: false,
    loadedPage: options.initialPage,
  });
  let generation = 0;
  let activeController: AbortController | undefined;

  const run = async (query: Query, mode: 'replace' | 'append') => {
    if (mode === 'replace') activeController?.abort();

    const currentGeneration = ++generation;
    const controller = new AbortController();
    activeController = controller;
    setState('loading', true);
    if (mode === 'replace') setState('error', false);

    try {
      const result = await options.loadPage(query, controller.signal);
      if (currentGeneration !== generation) return;

      setState('items', (current) => {
        if (mode === 'replace') return result.items;

        const known = new Set(current.map(options.getKey));
        return [...current, ...result.items.filter((item) => !known.has(options.getKey(item)))];
      });
      setState({ total: result.total, error: result.error, loadedPage: query.page });
    } catch {
      if (currentGeneration === generation && !controller.signal.aborted) setState('error', true);
    } finally {
      if (currentGeneration === generation) {
        activeController = undefined;
        setState('loading', false);
      }
    }
  };

  const cancel = () => {
    generation += 1;
    activeController?.abort();
    activeController = undefined;
    setState('loading', false);
  };

  return {
    items: () => state.items,
    total: () => state.total,
    error: () => state.error,
    loading: () => state.loading,
    loadedPage: () => state.loadedPage,
    hasMore: () => state.items.length < state.total && !state.error,
    loadInitial: (query: Query) => (options.initialResolved ? Promise.resolve() : run(query, 'replace')),
    replace: (query: Query) => run(query, 'replace'),
    cancel,
    loadMore: (query: Query) => {
      if (state.loading || state.error || !state.items.length || state.items.length >= state.total) return;
      return run({ ...query, page: state.loadedPage + 1 }, 'append');
    },
  };
}
