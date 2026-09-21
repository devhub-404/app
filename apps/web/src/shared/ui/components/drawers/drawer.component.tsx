import { Drawer as ArkDrawer } from '@ark-ui/solid/drawer';
import type { JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import { X } from 'lucide-solid';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  title: JSX.Element;
  description?: JSX.Element;
  trigger: (props: JSX.HTMLAttributes<HTMLButtonElement>) => JSX.Element;
  closeLabel?: string;
  children: JSX.Element;
  class?: string;
}

/**
 * Shared drawer shell. Ark owns focus, Escape, outside interaction and swipe behavior;
 * this facade owns only the visual contract of a DevHub side panel.
 */
export default function Drawer(props: Props) {
  return (
    <ArkDrawer.Root open={props.open} swipeDirection="end" onOpenChange={(details) => props.onOpenChange(details.open)}>
      <ArkDrawer.Trigger asChild={(getTriggerProps) => props.trigger(getTriggerProps())} />
      <Portal>
        <ArkDrawer.Backdrop class="fixed inset-0 z-50 bg-scrim" />
        <ArkDrawer.Positioner class="fixed inset-0 z-50 flex items-stretch justify-end p-3 sm:p-5">
          <ArkDrawer.Content
            aria-labelledby={props.titleId}
            class={`grid h-full w-full max-w-md content-start gap-5 overflow-y-auto rounded-3xl border border-line bg-surface-overlay p-6 shadow-ui-overlay ${props.class ?? ''}`.trim()}
          >
            <div class="flex items-start justify-between gap-4">
              <div class="grid gap-1">
                <ArkDrawer.Title id={props.titleId} class="text-lg font-semibold text-content">
                  {props.title}
                </ArkDrawer.Title>
                {props.description && (
                  <ArkDrawer.Description class="text-sm text-content-muted">{props.description}</ArkDrawer.Description>
                )}
              </div>
              <ArkDrawer.CloseTrigger
                type="button"
                aria-label={props.closeLabel ?? 'Fechar painel'}
                class="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-content-muted hover:bg-surface-subtle hover:text-content"
              >
                <X class="size-4" aria-hidden="true" />
              </ArkDrawer.CloseTrigger>
            </div>
            <div>{props.children}</div>
          </ArkDrawer.Content>
        </ArkDrawer.Positioner>
      </Portal>
    </ArkDrawer.Root>
  );
}
