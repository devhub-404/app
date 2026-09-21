import type { JSX } from 'solid-js';
import { splitProps } from 'solid-js';

type Status = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

type Props = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'classList'> & {
  status?: Status;
};

const statuses: Record<Status, string> = {
  neutral: 'border-line bg-surface-subtle text-content-muted',
  accent: 'border-action-border bg-action-subtle text-content-accent',
  success: 'border-success-border bg-success-bg text-success',
  warning: 'border-warning-border bg-warning-bg text-warning',
  danger: 'border-danger-border bg-danger-bg text-danger',
  info: 'border-info-border bg-info-bg text-info',
};

export default function StatusBadge(props: Props) {
  const [local, spanProps] = splitProps(props, ['children', 'class', 'status']);
  return (
    <span
      {...spanProps}
      class={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statuses[local.status ?? 'neutral']} ${local.class ?? ''}`.trim()}
    >
      {local.children}
    </span>
  );
}
