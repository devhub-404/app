import { createChangePasswordSchema, type ChangePasswordFormInput } from '@/features/account/ui/schemas/security.schema.ts';
import { Show } from 'solid-js';
import PasswordInput from '@/shared/ui/components/forms/password-input.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { useChangePassword } from '@/features/account/ui/hooks/settings/use-change-password.hook.ts';
import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { KeyRound } from 'lucide-solid';
interface Props {
  email: string;
  onAfterChange: () => Promise<void>;
}

export default function ChangePasswordSettings(props: Props) {
  const { t, locale } = useI18n();
  const password = useChangePassword(() => props.email, props.onAfterChange);
  const schema = createChangePasswordSchema(locale());
  const [_form, { Form, Field: FormField }] = createForm<ChangePasswordFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
  });
  return (
    <SectionCard>
      <SectionCardHeading title={t('constants.password')} description={t('passwordsection.changePasswordCurrent')} />
      <SectionCardBody>
        <Form onSubmit={(values) => void password.submit(values)} class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label for="pwd-current" class="field-label">{t('passwordsection.passwordCurrent')}</label>
            <FormField name="currentPassword">
              {(field, fieldProps) => (
                <PasswordInput
                  id="pwd-current"
                  value={field.value ?? ''}
                  autocomplete="current-password"
                  onValueChange={() => password.clearError()}
                  inputProps={fieldProps}
                />
              )}
            </FormField>
          </div>
          <div class="flex flex-col gap-4">
            <Field>
              <label for="pwd-new" class="field-label">{t('passwordsection.newPassword')}</label>
              <FormField name="newPassword">{(field, fieldProps) => <><PasswordInput id="pwd-new" value={field.value ?? ''} autocomplete="new-password" onValueChange={() => password.clearError()} inputProps={fieldProps} /><Show when={field.error}><span role="alert" class="field-error">{field.error}</span></Show></>}</FormField>
            </Field>
            <Field>
              <label for="pwd-confirm" class="field-label">{t('passwordsection.confirmPassword')}</label>
              <FormField name="confirmPassword">{(field, fieldProps) => <><PasswordInput id="pwd-confirm" value={field.value ?? ''} autocomplete="new-password" onValueChange={() => password.clearError()} inputProps={fieldProps} /><Show when={field.error}><span role="alert" class="field-error">{field.error}</span></Show></>}</FormField>
            </Field>
          </div>
          <div class="flex items-end">
            <button type="submit" disabled={password.busy()} class="action action-primary">
              <KeyRound class="size-4" />
              {password.busy() ? t('password.saving') : t('passwordsection.changePassword')}
            </button>
          </div>
        </Form>
        <Show when={password.error()}>{(error) => <p class="text-danger">{error()}</p>}</Show>
      </SectionCardBody>
    </SectionCard>
  );
}
