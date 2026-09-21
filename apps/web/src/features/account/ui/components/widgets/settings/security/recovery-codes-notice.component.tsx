import { useI18n } from '@/features/account/i18n';
import { Eye } from 'lucide-solid';
import { createEffect, createSignal, Show } from 'solid-js';
import { Dialog } from '@ark-ui/solid/dialog';
export default function RecoveryCodesNotice(props: { codes: string[] }) {
  const { t } = useI18n();
  const [open, setOpen] = createSignal(false);

  createEffect(() => {
    if (props.codes.length > 0) setOpen(true);
  });

  return (
    <Show when={props.codes.length > 0}>
      <section id="recovery-codes" class="rounded-2xl border border-action-border bg-action-subtle p-4">
        <p class="text-strong">{t('securitysection.storeTheseRecoveryCodesNow')}</p>
        <p class="text-caption mt-1">
          {t('securitysection.recoveryCodesShownOnce')}
        </p>
        <div class="mt-3">
          <button type="button" onClick={() => setOpen(true)} class="action action-secondary">
            <Eye class="size-4" />
            {t('securitysection.viewRecoveryCodes')}
          </button>
        </div>
      </section>
      <Dialog.Root open={open()} onOpenChange={(details) => setOpen(details.open)}>
        <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Positioner class="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Content class="grid w-full max-w-md gap-5 rounded-3xl border border-line bg-surface-elevated p-6 shadow-ui-overlay">
            <Dialog.Title class="text-lg font-semibold text-content">
              {t('securitysection.recoveryCodesTitle')}
            </Dialog.Title>
            <Dialog.Description class="text-sm text-content-muted">
              {t('securitysection.storeTheseRecoveryCodesNow')}
            </Dialog.Description>
            <code class="block whitespace-pre-wrap rounded-2xl bg-surface-subtle p-4 text-sm text-content">
              {props.codes.join('\n')}
            </code>
            <Dialog.CloseTrigger
              asChild={(triggerProps) => (
                <button {...triggerProps} type="button" class="action action-primary w-full">
                  {t('securitysection.closeRecoveryCodes')}
                </button>
              )}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Show>
  );
}
