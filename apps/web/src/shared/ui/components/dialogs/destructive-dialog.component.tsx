import { Dialog } from '@ark-ui/solid/dialog';
import type { JSX } from 'solid-js';
import { Trash, X } from 'lucide-solid';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  accessibleLabel?: string;
  title: JSX.Element;
  description?: JSX.Element;
  confirmLabel: string;
  cancelLabel: string;
  busy?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
}

/** Confirmation dialog for irreversible actions. Ark owns the dialog lifecycle and focus behavior. */
export default function DestructiveDialog(props: Props) {
  return (
    <Dialog.Root open={props.open} role="alertdialog" onOpenChange={(details) => props.onOpenChange(details.open)}>
      <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
      <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-8">
        <Dialog.Content
          aria-label={props.accessibleLabel}
          aria-labelledby={props.titleId}
          class="grid w-full max-w-lg gap-6 rounded-3xl border border-danger-border bg-surface-overlay p-6 shadow-ui-overlay sm:p-8"
        >
          <div class="grid gap-2">
            <Dialog.Title id={props.titleId} class="text-xl font-semibold text-content">
              {props.title}
            </Dialog.Title>
            {props.description && (
              <Dialog.Description class="text-sm text-content-muted">{props.description}</Dialog.Description>
            )}
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            <Dialog.CloseTrigger
              asChild={(triggerProps) => (
                <button {...triggerProps} type="button" disabled={props.busy} class="action action-secondary">
                  <X class="size-4" aria-hidden="true" />
                  {props.cancelLabel}
                </button>
              )}
            />
            <button
             
              type="button"
             
              disabled={props.confirmDisabled}
              onClick={props.onConfirm} aria-busy={props.busy} class="action action-danger"
            >
              <Trash class="size-4" aria-hidden="true" />
              {props.confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
