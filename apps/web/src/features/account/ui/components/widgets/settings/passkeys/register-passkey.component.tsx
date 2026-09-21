import Field from '@/shared/ui/components/forms/field.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { KeyRound } from 'lucide-solid';
import { createPasskeyDeviceNameSchema, type PasskeyDeviceNameFormInput } from '@/features/account/ui/schemas/mfa.schema.ts';

interface Props {
  busy: boolean;
  onRegister: (values: PasskeyDeviceNameFormInput) => void;
}

export default function RegisterPasskey(props: Props) {
  const { t, locale } = useI18n();
  const [_form, { Form, Field: FormField }] = createForm<PasskeyDeviceNameFormInput>({
    validate: zodForm(createPasskeyDeviceNameSchema(locale())),
    validateOn: 'submit',
  });
  return (
    <Form onSubmit={props.onRegister} class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <Field>
        <label for="new-passkey-name" class="field-label">
          {t('securitysection.nameDevice')}{' '}
          <span class="font-normal normal-case tracking-normal">{t('securitysection.optional')}</span>
        </label>
        <FormField name="deviceName">{(_, fieldProps) => <input {...fieldProps} id="new-passkey-name"  class="field-control"/>}</FormField>
      </Field>
      <button type="submit" disabled={props.busy} class="action action-primary">
        <KeyRound class="size-4" />
        {t('securitysection.addPasskey')}
      </button>
    </Form>
  );
}
