import { Toast as ArkToast, Toaster, createToaster } from '@ark-ui/solid/toast';
import { onCleanup, onMount } from 'solid-js';
import { X } from 'lucide-solid';
import { consumePendingToast, type ToastPayload } from '@/shared/ui/feedback/toast';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/shared/i18n';

const toaster = createToaster({
  placement: 'bottom-end',
  max: 4,
  duration: 4200,
  gap: 12,
  offsets: '1.5rem',
});

function Toast() {
  const { t } = useI18n();

  const addToast = (payload: ToastPayload) => {
    toaster.create({
      description: payload.message,
      type: payload.variant ?? 'info',
      closable: true,
    });
  };

  onMount(() => {
    const listener = (event: Event) => addToast((event as CustomEvent<ToastPayload>).detail);
    const afterSwap = () => {
      const pending = consumePendingToast();
      if (pending) addToast(pending);
    };

    window.addEventListener('devhub:toast', listener);
    document.addEventListener('astro:after-swap', afterSwap);
    const pending = consumePendingToast();
    if (pending) addToast(pending);

    onCleanup(() => {
      window.removeEventListener('devhub:toast', listener);
      document.removeEventListener('astro:after-swap', afterSwap);
    });
  });

  return (
    <Toaster toaster={toaster}>
      {(toast) => {
        const type = () => toast().type;
        const statusClass = () =>
          type() === 'success'
            ? 'border-success-border'
            : type() === 'error'
              ? 'border-danger-border'
              : type() === 'warning'
                ? 'border-warning-border'
                : 'border-info-border';

        return (
          <ArkToast.Root
            class={`relative w-[min(360px,90vw)] rounded-2xl border bg-surface-overlay p-4 text-content shadow-ui-overlay backdrop-blur ${statusClass()}`}
          >
            <ArkToast.Description class="pr-8 text-sm font-semibold">{toast().description}</ArkToast.Description>
            <ArkToast.CloseTrigger
              type="button"
              aria-label={t('toast.close')}
              class="absolute right-3 top-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-subtle hover:text-content"
            >
              <X class="size-4" aria-hidden="true" />
            </ArkToast.CloseTrigger>
          </ArkToast.Root>
        );
      }}
    </Toaster>
  );
}

export default withLocale(Toast);
