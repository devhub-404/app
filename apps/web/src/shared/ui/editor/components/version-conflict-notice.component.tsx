import type { JSX } from 'solid-js';

interface Props {
  message: string;
  content: string;
  actions: JSX.Element;
}

export default function VersionConflictNotice(props: Props) {
  return (
    <div class="grid gap-3 rounded-xl border border-warning-border bg-warning-bg p-4 text-sm">
      <p class="text-strong">{props.message}</p>
      <pre class="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-surface p-3 text-xs">{props.content}</pre>
      <div>{props.actions}</div>
    </div>
  );
}
