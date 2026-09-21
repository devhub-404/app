import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createSignal, Show } from 'solid-js';
import { createForm, setError } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import type { ForgotPasswordDTO } from '@/features/auth/types/auth.type.ts';
import { createAuthSchemas } from '@/features/auth/ui/schemas/forms.schema.ts';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { useI18n } from '@/features/auth/i18n';
import { Mail, MoveLeft } from 'lucide-solid';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { routes } from '@/shared/navigation/routes';
import type { Locale } from '@/shared/i18n/core';
function ForgotPasswordForm(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { requestPasswordReset } = useAuth();
  const forgotPasswordSchema = createAuthSchemas(props.locale).forgotPassword;
  const [sent, setSent] = createSignal(false);
  const [forgotForm, { Form, Field: FormField }] = createForm<ForgotPasswordDTO>({
    validate: zodForm(forgotPasswordSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const handleSubmit = async (values: ForgotPasswordDTO) => {
    setSent(false);
    const result = await requestPasswordReset(values);
    if (!result) {
      setError(forgotForm, 'email', resolveMessage('DEFAULT_ERROR', props.locale), {
        shouldTouched: true,
        shouldDirty: true,
      });
      return;
    }
    setSent(true);
  };

  return (
    <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field>
        <label for="forgot-email" class="field-label">{t('common.email')}</label>
        <FormField name="email">
          {(field, fieldProps) => (
            <>
              <input
                {...fieldProps}
                id="forgot-email"
                type="email"
                autocomplete="email"
                placeholder={t('common.emailPlaceholder')}
                aria-invalid={Boolean(field.error)}
                value={field.value ?? ''}
               class="field-control"/>
              <Show when={field.error}>
                <span role="alert" class="field-error">{field.error}</span>
              </Show>
            </>
          )}
        </FormField>
      </Field>
      <Show when={sent()}>
        <p role="status" class="text-body rounded-2xl border border-action-border bg-action-subtle p-4">
          {t('forgot.uniformAck')}
        </p>
      </Show>
      <button type="submit" disabled={forgotForm.submitting} aria-busy={forgotForm.submitting} class="action action-primary">
        <Mail class="size-4" />
        {forgotForm.submitting ? t('common.sending') : t('forgot.send')}
      </button>
      <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-content-muted">
        <a href={routes.auth.signIn} class="inline-flex items-center gap-2 font-semibold text-content">
          <MoveLeft class="size-4" /> {t('common.backToLogin')}
        </a>
        <a href={routes.auth.accountRecovery} class="font-semibold text-content-accent">
          {t('forgot.backupRecovery')}
        </a>
      </div>
    </Form>
  );
}

export default ForgotPasswordForm;
