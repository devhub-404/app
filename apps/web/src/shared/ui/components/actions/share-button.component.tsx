import { createSignal, Show } from 'solid-js';
import { Share2 } from 'lucide-solid';
import { shareOrCopy } from '@/shared/ui/interactions/share-or-copy';

type Props = {
  title: string;
  url: string;
  label: string;
  copiedLabel: string;
};

export default function ShareButton(props: Props) {
  const [copied, setCopied] = createSignal(false);
  const share = async () => {
    const absoluteUrl = new URL(props.url, window.location.origin).toString();
    const result = await shareOrCopy(props.title, absoluteUrl);
    if (result !== 'copied') return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <span class="relative inline-flex">
      <button
        type="button"
        onClick={() => void share()}
        aria-label={props.label}
        title={props.label} class="action action-secondary"
       
      >
        <Share2 class="size-4" aria-hidden="true" />
      </button>
      <Show when={copied()}>
        <span
          class="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-lg bg-surface-overlay px-2 py-1 text-xs text-content-muted shadow"
          role="status"
          aria-live="polite"
        >
          {props.copiedLabel}
        </span>
      </Show>
    </span>
  );
}
