import Field from '@/shared/ui/components/forms/field.component.tsx';
import { Mail, Check } from 'lucide-solid';
import { createSignal } from 'solid-js';
import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { useI18n } from '@/features/account/i18n';
import { createEmailSettingsSchemas, type ChangeEmailFormInput, type EmailVerificationFormInput } from '@/features/account/ui/schemas/email.schema.ts';
type Props = {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  tokenLabel: string;
  tokenPlaceholder: string;
  requestLabel: string;
  completeLabel: string;
  busy: boolean;
  inputId: string;
  tokenId: string;
  onRequest: (email: string) => void;
  onComplete: (token: string) => void;
};

export default function EmailVerificationSettings(props: Props) {
  const { locale } = useI18n();
  const schemas = createEmailSettingsSchemas(locale());
  type FormInput = ChangeEmailFormInput & EmailVerificationFormInput;
  const [_form, { Form, Field: FormField }] = createForm<FormInput>({
    validate: zodForm(schemas.changeEmail),
    validateOn: 'submit',
  });
  const [action, setAction] = createSignal<'request' | 'complete'>('request');
  return (
    <Form
      onSubmit={(value) => (action() === 'request' ? props.onRequest(value.email) : props.onComplete(value.token))}
      class="rounded-2xl border border-line bg-surface p-4"
    >
      <h3 class="heading-callout text-sm">
        {props.title}
      </h3>
      <p class="text-caption mt-1">
        {props.description}
      </p>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <Field>
          <label for={props.inputId} class="field-label">{props.emailLabel}</label>
          <FormField name="email">
            {(_, fieldProps) => (
              <input
                {...fieldProps}
                id={props.inputId}
                type="email"
                autocomplete="email"
                placeholder={props.emailPlaceholder}
               class="field-control"/>
            )}
          </FormField>
        </Field>
        <Field>
          <label for={props.tokenId} class="field-label">{props.tokenLabel}</label>
          <FormField name="token">
            {(_, fieldProps) => <input {...fieldProps} id={props.tokenId} placeholder={props.tokenPlaceholder}  class="field-control"/>}
          </FormField>
        </Field>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="submit" disabled={props.busy} onClick={() => setAction('request')} class="action action-secondary">
          <Mail class="size-4" />
          {props.requestLabel}
        </button>
        <button type="submit" disabled={props.busy} onClick={() => setAction('complete')} class="action action-primary">
          <Check class="size-4" />
          {props.completeLabel}
        </button>
      </div>
    </Form>
  );
}
