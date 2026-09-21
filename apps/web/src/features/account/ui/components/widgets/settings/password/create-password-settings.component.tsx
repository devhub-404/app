import Field from '@/shared/ui/components/forms/field.component.tsx';
import PasswordInput from '@/shared/ui/components/forms/password-input.component.tsx';
import { createPasswordCredentialSchema, type PasswordCredentialFormInput } from '@/features/account/ui/schemas/security.schema.ts';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { useCreatePassword } from '@/features/account/ui/hooks/settings/use-create-password.hook.ts';
import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { Show } from 'solid-js';
import { Check, KeyRound, Mail } from 'lucide-solid';
export default function CreatePasswordSettings(props: { onAfterChange: () => Promise<void> }) {
  const { t, locale } = useI18n();
  const password = useCreatePassword(props.onAfterChange);
  const [_form, { Form, Field: FormField }] = createForm<PasswordCredentialFormInput>({
    validate: zodForm(createPasswordCredentialSchema(locale())),
    validateOn: 'submit',
  });
  return (
    <SectionCard>
      <SectionCardHeading
        title={t('constants.password')}
        description={t('passwordsection.setPasswordEnableLoginLocationBeyondOauth')}
      />
      <SectionCardBody>
        <section class="grid gap-3 rounded-2xl border border-line bg-surface p-4">
          <div class="grid gap-1">
            <p class="text-strong">{t('passwordsection.proofRecent')}</p>
            <p class="text-caption">
              {t('passwordsection.createNewCredentialPasswordRequiresProofRecentPossession')}
            </p>
          </div>
          <Show
            when={!password.proofAccepted()}
            fallback={<p class="text-accent">{t('passwordsection.proofAcceptedThisSession')}</p>}
          >
            <div class="flex flex-wrap items-end gap-2">
              <button
               
                type="button"
                disabled={password.busy()}
                onClick={() => void password.requestProof()} class="action action-secondary"
              >
                <Mail class="size-4" />
                {t('passwordsection.sendCode')}
              </button>
              <Show when={password.proofSent()}>
                <Field>
                  <label for="password-proof-code" class="field-label">{t('passwordsection.codeReceived')}</label>
                  <input
                    id="password-proof-code"
                    autocomplete="one-time-code"
                    value={password.proofCode()}
                    onInput={(event) => password.setProofCode(event.currentTarget.value)}
                   class="field-control"/>
                </Field>
                <button
                 
                  type="button"
                  disabled={password.busy() || !password.proofCode().trim()}
                  onClick={() => void password.confirmProof()} class="action action-primary"
                >
                  <Check class="size-4" />
                  {t('passwordsection.confirmProof')}
                </button>
              </Show>
            </div>
            <Show when={password.reauthRequired()}>
              <p class="text-danger-caption">
                {t('passwordsection.accountUsesMfaReauthenticateMfaBeforeChangeCredentialsCodeEmail')}
              </p>
            </Show>
          </Show>
        </section>
        <Form onSubmit={(values) => void password.submit(values)} class="grid gap-4 sm:grid-cols-2">
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
            <button type="submit" disabled={password.busy() || !password.proofAccepted()} class="action action-primary">
              <KeyRound class="size-4" />
              {password.busy() ? t('password.saving') : t('passwordsection.setPassword')}
            </button>
          </div>
        </Form>
        <Show when={password.error()}>{(error) => <p class="text-danger">{error()}</p>}</Show>
      </SectionCardBody>
    </SectionCard>
  );
}
