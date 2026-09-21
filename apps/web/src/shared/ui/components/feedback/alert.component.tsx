import type { JSX } from 'solid-js';
import { splitProps } from 'solid-js';

type AlertStatus = 'info' | 'success' | 'warning' | 'danger';

type Props = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'classList' | 'role'> & {
  status?: AlertStatus;
  title?: JSX.Element;
  role?: 'alert' | 'status';
};

const statuses: Record<AlertStatus, string> = {
  info: 'border-info-border bg-info-bg text-info',
  success: 'border-success-border bg-success-bg text-success',
  warning: 'border-warning-border bg-warning-bg text-warning',
  danger: 'border-danger-border bg-danger-bg text-danger',
};

export default function Alert(props: Props) {
  const [local, divProps] = splitProps(props, ['children', 'class', 'status', 'title', 'role']);
  const status = () => local.status ?? 'info';
  const role = () => local.role ?? (status() === 'danger' || status() === 'warning' ? 'alert' : 'status');

  return (
    <div
      {...divProps}
      role={role()}
      aria-live={role() === 'alert' ? 'assertive' : 'polite'}
      class={`grid gap-1 rounded-xl border p-4 text-sm ${statuses[status()]} ${local.class ?? ''}`.trim()}
    >
      {local.title && (
        <h3 class="heading-callout text-current">
          {local.title}
        </h3>
      )}
      <div class="text-current">{local.children}</div>
    </div>
  );
}
