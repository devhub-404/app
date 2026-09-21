import { Trash, X } from 'lucide-solid';

interface Props {
  accessibleLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DestructiveConfirmation(props: Props) {
  return (
    <div
      class="grid gap-3 rounded-xl border border-danger-border bg-danger-bg p-4"
      role="group"
      aria-label={props.accessibleLabel}
    >
      <div class="grid gap-1">
        <p class="text-strong">{props.title}</p>
        <p class="text-muted">{props.description}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" disabled={props.busy} onClick={props.onConfirm} class="action action-danger">
          <Trash class="size-4" />
          {props.confirmLabel}
        </button>
        <button type="button" onClick={props.onCancel} class="action action-secondary">
          <X class="size-4" />
          {props.cancelLabel}
        </button>
      </div>
    </div>
  );
}
