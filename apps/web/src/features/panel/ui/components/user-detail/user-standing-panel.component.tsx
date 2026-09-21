import { Ban, ShieldAlert } from 'lucide-solid';
import { createForm, reset, setValue } from '@modular-forms/solid';
import { For } from 'solid-js';
import type { AccountStandingDTO } from '@/features/panel/types/panel.type.ts';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { useI18n } from '@/features/panel/i18n';
import {
  ACCOUNT_RESTRICTION_CAPABILITIES,
  createUserAdminSchemas,
  type RestrictionFormInput,
} from '@/features/panel/ui/schemas/user-admin.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';

export default function UserStandingPanel(props: {
  standing: AccountStandingDTO | null;
  busy: boolean;
  onRestrict: (capability: RestrictionFormInput['capability'], reason: string) => Promise<boolean>;
  onRevoke: (restrictionId: string) => Promise<boolean>;
}) {
  const { t, locale } = useI18n();
  const schemas = () => createUserAdminSchemas(locale());
  const [form, { Form, Field: FormField }] = createForm<RestrictionFormInput>({
    initialValues: { capability: 'CONTRIBUTION', reason: '' },
    validate: zodForm(schemas().restriction),
  });

  const applyRestriction = async (values: RestrictionFormInput) => {
    if (await props.onRestrict(values.capability, values.reason)) {
      reset(form, { initialValues: { capability: values.capability, reason: '' } });
    }
  };

  return (
    <section
      class="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3"
      aria-labelledby="user-standing-heading"
    >
      <h2 id="user-standing-heading" class="heading-tiny text-xs">
        {t('useradmindetail.communityStanding')}
      </h2>
      <p class="text-body">
        {props.standing?.standing === 'restricted' ? t('userDetail.standingRestricted') : t('userDetail.standingClear')}
      </p>
      <div class="flex flex-col gap-2">
        <For each={(props.standing?.restrictions ?? []).filter((item) => !item.revokedAt)}>
          {(restriction) => (
            <div class="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
              <span>
                {restriction.capability}: {restriction.reason}
              </span>
              <button
               
                type="button"
                disabled={props.busy}
                onClick={() => void props.onRevoke(restriction.id)} class="action action-secondary"
              >
                <Ban class="size-4" aria-hidden="true" />
                {t('useradmindetail.revoke')}
              </button>
            </div>
          )}
        </For>
      </div>
      <Form onSubmit={applyRestriction} class="flex flex-wrap items-end gap-2">
        <FormField name="capability">
          {(field) => (
            <div class="min-w-52">
              <Select
                id="restriction-capability"
                label={t('useradmindetail.capability')}
                value={field.value ?? 'CONTRIBUTION'}
                options={ACCOUNT_RESTRICTION_CAPABILITIES.map((value) => ({ value, label: value }))}
                onChange={(value) => setValue(form, 'capability', value as RestrictionFormInput['capability'])}
              />
              {field.error ? <span class="field-error mt-1" role="alert">{field.error}</span> : null}
            </div>
          )}
        </FormField>
        <FormField name="reason">
          {(field, fieldProps) => (
            <div class="min-w-56 flex-1">
              <label for="restriction-reason" class="field-label">{t('useradmindetail.reason')}</label>
              <input {...fieldProps} id="restriction-reason" value={field.value ?? ''}  class="field-control"/>
              {field.error ? <span class="field-error mt-1" role="alert">{field.error}</span> : null}
            </div>
          )}
        </FormField>
        <button type="submit" disabled={props.busy} aria-busy={props.busy} class="action action-primary">
          <ShieldAlert class="size-4" aria-hidden="true" />
          {t('useradmindetail.applyRestriction')}
        </button>
      </Form>
    </section>
  );
}
