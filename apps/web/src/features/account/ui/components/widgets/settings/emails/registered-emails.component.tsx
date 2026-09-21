import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import { For, Show } from 'solid-js';
import type { EmailDTO } from '@/features/account/types/account.type.ts';
import { useI18n } from '@/features/account/i18n';
import { Check, Mail, Trash, X } from 'lucide-solid';
interface Props {
  emails: EmailDTO[];
  busy: boolean;
  removeCandidate: string | null;
  onVerifyPrimary: () => void;
  onResendBackup: (email: string) => void;
  onRequestRemove: (email: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: (email: string) => void;
}

export default function RegisteredEmails(props: Props) {
  const { t } = useI18n();
  return (
    <Surface padding="sm">
      <h3 class="heading-callout text-sm">
        {t('emailssection.emailsRegistered')}
      </h3>
      <div class="mt-4 flex flex-col gap-2">
        <Show when={props.emails.length > 0} fallback={<p class="text-muted">{t('emailssection.noEmailFound')}</p>}>
          <For each={props.emails}>
            {(item) => (
              <div class="flex flex-col gap-2 rounded-2xl border border-line bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="text-strong truncate">
                    {item.email}
                  </p>
                  <p class="text-caption mt-1">
                    {item.type === 'primary' ? t('emailssection.primary') : t('emailssection.backup')} ·{' '}
                    {item.verifiedAt ? t('emailssection.verified') : t('emailssection.notVerified')}
                  </p>
                </div>
                <Show when={item.type === 'primary' && !item.verifiedAt}>
                  <button type="button" disabled={props.busy} onClick={props.onVerifyPrimary} class="action action-secondary">
                    <Check class="size-4" />
                    {t('emailssection.verify')}
                  </button>
                </Show>
                <Show when={item.type === 'backup'}>
                  <div class="flex flex-wrap items-center gap-2">
                    <Show when={!item.verifiedAt}>
                      <button
                       
                        type="button"
                        disabled={props.busy}
                        onClick={() => props.onResendBackup(item.email)} class="action action-secondary"
                      >
                        <Mail class="size-4" />
                        {t('emailssection.resend')}
                      </button>
                    </Show>
                    <Show
                      when={props.removeCandidate !== item.email}
                      fallback={
                        <>
                          <span class="text-xs text-content-muted">{t('emailssection.removeThisRecoveryEmail')}</span>
                          <button
                           
                            type="button"
                            disabled={props.busy}
                            onClick={() => props.onConfirmRemove(item.email)} class="action action-danger"
                          >
                            <Trash class="size-4" />
                            {t('emailssection.confirm')}
                          </button>
                          <button
                           
                            type="button"
                            disabled={props.busy}
                            onClick={props.onCancelRemove} class="action action-secondary"
                          >
                            <X class="size-4" />
                            {t('myarticles.cancel')}
                          </button>
                        </>
                      }
                    >
                      <button
                       
                        type="button"
                        disabled={props.busy}
                        onClick={() => props.onRequestRemove(item.email)} class="action action-secondary"
                      >
                        <Trash class="size-4" />
                        {t('bookmarks.remove')}
                      </button>
                    </Show>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </Show>
      </div>
    </Surface>
  );
}
