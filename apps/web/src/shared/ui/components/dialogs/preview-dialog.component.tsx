import { Dialog } from '@ark-ui/solid/dialog';
import type { JSX } from 'solid-js';
import { X } from 'lucide-solid';

interface Props {
  titleId: string;
  closeLabel: string;
  onClose: () => void;
  header: JSX.Element;
  children: JSX.Element;
}

export default function PreviewDialog(props: Props) {
  return (
    <Dialog.Root open={true} onOpenChange={(details) => !details.open && props.onClose()}>
      <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
      <Dialog.Positioner class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
        <Dialog.Content
          aria-labelledby={props.titleId}
          class="my-4 grid w-full max-w-3xl gap-6 rounded-3xl border border-line bg-surface-elevated p-6 shadow-ui-surface sm:my-8 sm:p-8"
        >
          <div class="flex items-start justify-between gap-4 border-b border-line pb-5">
            {props.header}
            <Dialog.CloseTrigger
              type="button"
              class="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-content transition duration-standard ease-standard hover:border-action-border hover:bg-surface-subtle hover:text-content-accent"
            >
              <X class="size-4" />
              {props.closeLabel}
            </Dialog.CloseTrigger>
          </div>
          <div>{props.children}</div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
