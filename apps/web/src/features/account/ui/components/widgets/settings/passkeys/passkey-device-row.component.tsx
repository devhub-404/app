import Field from '@/shared/ui/components/forms/field.component.tsx';
import { Show } from 'solid-js';
import { useI18n } from '@/features/account/i18n';
import { Pencil, Trash, Save, X } from 'lucide-solid';
import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createPasskeyDeviceNameSchema, type PasskeyDeviceNameFormInput } from '@/features/account/ui/schemas/mfa.schema.ts';
import type { PasskeyDeviceDTO as PasskeyDevice } from '@/features/auth/types/auth.type.ts';
interface Props {
  device: PasskeyDevice;
  busy: boolean;
  editing: boolean;
  removing: boolean;
  onBeginRename: () => void;
  onCancelRename: () => void;
  onRename: (values: PasskeyDeviceNameFormInput) => void;
  onBeginRemove: () => void;
  onCancelRemove: () => void;
  onRemove: () => void;
}

export default function PasskeyDeviceRow(props: Props) {
  const { t, locale } = useI18n();
  const [_form, { Form, Field: FormField }] = createForm<PasskeyDeviceNameFormInput>({
    initialValues: { deviceName: props.device.deviceName ?? '' },
    validate: zodForm(createPasskeyDeviceNameSchema(locale())),
    validateOn: 'submit',
  });
  const name = () => props.device.deviceName ?? t('securitysection.deviceWithoutName');
  return (
    <article class="rounded-xl border border-line bg-surface px-3 py-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-body">{name()}</p>
          <p class="text-caption">
            {props.device.deviceType}
            {props.device.backedUp ? ` · ${t('securitysection.synced')}` : ''}
          </p>
        </div>
        <div class="flex gap-2">
          <button type="button" disabled={props.busy} onClick={props.onBeginRename} class="action action-secondary">
            <Pencil class="size-4" />
            {t('securitysection.rename')}
          </button>
          <button type="button" disabled={props.busy} onClick={props.onBeginRemove} class="action action-secondary">
            <Trash class="size-4" />
            {t('bookmarks.remove')}
          </button>
        </div>
      </div>

      <Show when={props.editing}>
        <Form onSubmit={props.onRename} class="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field>
            <label for={`passkey-name-${props.device.credentialId}`} class="field-label">{t('securitysection.nameDevice')}</label>
            <FormField name="deviceName">
              {(_, fieldProps) => <input {...fieldProps} id={`passkey-name-${props.device.credentialId}`}  class="field-control"/>}
            </FormField>
          </Field>
          <button type="submit" disabled={props.busy} class="action action-primary">
            <Save class="size-4" />
            {t('securitysection.save')}
          </button>
          <button type="button" disabled={props.busy} onClick={props.onCancelRename} class="action action-secondary">
            <X class="size-4" />
            {t('myarticles.cancel')}
          </button>
        </Form>
      </Show>

      <Show when={props.removing}>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger-border bg-danger-bg p-3">
          <p class="text-caption">
            {t('bookmarks.remove')} <strong class="text-content">{name()}</strong>
            {t('securitysection.thisCredentialMakesAuthenticateAccount')}
          </p>
          <div class="flex gap-2">
            <button type="button" disabled={props.busy} onClick={props.onRemove} class="action action-danger">
              <Trash class="size-4" />
              {t('securitysection.confirmRemoval')}
            </button>
            <button type="button" disabled={props.busy} onClick={props.onCancelRemove} class="action action-secondary">
              <X class="size-4" />
              {t('myarticles.cancel')}
            </button>
          </div>
        </div>
      </Show>
    </article>
  );
}
