import { RefreshCw } from 'lucide-solid';

export default function RetryErrorState(props: { message: string; retryLabel: string; onRetry: () => void }) {
  return (
    <div class="grid gap-3 px-6 py-8">
      <p class="text-danger">{props.message}</p>
      <div>
        <button type="button" onClick={props.onRetry} class="action action-secondary">
          <RefreshCw class="size-4" />
          {props.retryLabel}
        </button>
      </div>
    </div>
  );
}
