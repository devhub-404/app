import { Show, onCleanup, onMount } from 'solid-js';

type Props = {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  label: string;
};

function InfiniteScrollSentinel(props: Props) {
  let element: HTMLDivElement | undefined;

  onMount(() => {
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && props.hasMore && !props.loading) props.onLoadMore();
      },
      { rootMargin: '640px 0px' },
    );

    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  return (
    <div ref={element} class="flex min-h-10 items-center justify-center text-sm text-content-muted" aria-live="polite">
      <Show when={props.loading}>
        <span>{props.label}</span>
      </Show>
    </div>
  );
}

export default InfiniteScrollSentinel;
