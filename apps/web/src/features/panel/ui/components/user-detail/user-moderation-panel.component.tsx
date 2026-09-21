import { Ban, CircleCheck, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-solid';
import { createForm, reset } from '@modular-forms/solid';
import { useI18n } from '@/features/panel/i18n';
import { createUserAdminSchemas, type SuspensionFormInput } from '@/features/panel/ui/schemas/user-admin.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';

export default function UserModerationPanel(props: {
  busy: boolean;
  canSuspend: boolean;
  canUnsuspend: boolean;
  canBan: boolean;
  canUnban: boolean;
  onSuspend: (until: string) => Promise<boolean>;
  onUnsuspend: () => void;
  onBan: () => void;
  onUnban: () => void;
  onReload: () => void;
}) {
  const { t, locale } = useI18n();
  const schemas = () => createUserAdminSchemas(locale());
  const [form, { Form, Field: FormField }] = createForm<SuspensionFormInput>({
    validate: zodForm(schemas().suspension),
  });

  const suspend = async (values: SuspensionFormInput) => {
    if (await props.onSuspend(values.lockedUntil)) reset(form);
  };

  return (
    <section
      class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3"
      aria-labelledby="user-moderation-heading"
    >
      <h2 id="user-moderation-heading" class="heading-tiny text-xs">
        {t('useradmindetail.suspendUser')}
      </h2>
      <Form onSubmit={suspend} class="flex flex-wrap items-end gap-2">
        <FormField name="lockedUntil">
          {(field, fieldProps) => (
            <div>
              <label for="suspend-until" class="field-label">{t('useradmindetail.suspendUpTo')}</label>
              <input {...fieldProps} id="suspend-until" type="datetime-local" value={field.value ?? ''}  class="field-control"/>
              {field.error ? <span class="field-error mt-1" role="alert">{field.error}</span> : null}
            </div>
          )}
        </FormField>
        <button type="submit" disabled={props.busy || !props.canSuspend} aria-busy={props.busy} class="action action-secondary">
          <ShieldAlert class="size-4" aria-hidden="true" />
          {t('useradmindetail.suspend')}
        </button>
      </Form>
      <div class="flex flex-wrap gap-2">
        <button
         
          type="button"
          onClick={props.onUnsuspend}
          disabled={props.busy || !props.canUnsuspend} class="action action-secondary"
        >
          <ShieldCheck class="size-4" aria-hidden="true" />
          {t('useradmindetail.removeSuspension')}
        </button>
        <button type="button" onClick={props.onBan} disabled={props.busy || !props.canBan} class="action action-danger">
          <Ban class="size-4" aria-hidden="true" />
          {t('useradmindetail.ban')}
        </button>
        <button type="button" onClick={props.onUnban} disabled={props.busy || !props.canUnban} class="action action-secondary">
          <CircleCheck class="size-4" aria-hidden="true" />
          {t('useradmindetail.removeBan')}
        </button>
        <button type="button" onClick={props.onReload} disabled={props.busy} class="action action-primary">
          <RefreshCw class="size-4" aria-hidden="true" />
          {t('newssuggestionsadminlist.update')}
        </button>
      </div>
    </section>
  );
}
