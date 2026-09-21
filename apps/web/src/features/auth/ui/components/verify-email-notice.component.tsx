import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { LogIn, Send } from 'lucide-solid';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { useI18n } from '@/features/auth/i18n';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { routes } from '@/shared/navigation/routes';
import type { Locale } from '@/shared/i18n/core';
import { createAuthSchemas } from '@/features/auth/ui/schemas/forms.schema.ts';
import { createSignal, onMount, Show } from 'solid-js';
function VerifyEmailNotice(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { verifyEmail, resendVerification } = useAuth();
  const [resendForm, { Form, Field: FormField }] = createForm<{ email: string }>({
    validate: zodForm(createAuthSchemas(props.locale).resendVerification),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const [status, setStatus] = createSignal<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [message, setMessage] = createSignal<string | null>(null);

  onMount(async () => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;
    setStatus('verifying');
    try {
      const result = await verifyEmail(token);
      if (result) {
        setStatus('verified');
        setMessage(t('verify.verified'));
        return;
      }
      setStatus('error');
      setMessage(resolveMessage('DEFAULT_ERROR', props.locale));
    } catch {
      setStatus('error');
      setMessage(resolveMessage('DEFAULT_ERROR', props.locale));
    }
  });

  const resend = async (values: { email: string }) => {
    const value = values.email.trim().toLowerCase();
    setMessage(null);
    try {
      const result = await resendVerification({ email: value });
      setMessage(resolveMessage(result ? 'DEFAULT_SUCCESS' : 'DEFAULT_ERROR', props.locale));
    } catch {
      setMessage(resolveMessage('DEFAULT_ERROR', props.locale));
    }
  };

  return (
    <div class="rounded-3xl border border-line bg-surface-subtle p-6 text-sm text-content-muted">
      <p class="text-body">{t('verify.notice')}</p>
      <Show when={status() === 'verifying'}>
        <p class="text-muted mt-3">
          {t('verify.validating')}
        </p>
      </Show>
      <Show when={status() === 'verified'}>
        <p role="status" class="text-success mt-3">
          {message()}
        </p>
      </Show>
      <Show when={status() === 'error'}>
        <p role="alert" class="text-danger mt-3">
          {message()}
        </p>
      </Show>
      <Form class="mt-5 flex flex-col gap-2" onSubmit={resend}>
        <Field>
          <label for="resend-email" class="field-label">{t('verify.resendLabel')}</label>
          <FormField name="email">
            {(field, fieldProps) => (
              <>
                <div class="flex flex-col gap-2 sm:flex-row">
                  <input
                    {...fieldProps}
                    id="resend-email"
                    type="email"
                    autocomplete="email"
                    placeholder={t('common.emailPlaceholder')}
                    value={field.value ?? ''}
                    aria-invalid={Boolean(field.error)}
                   class="field-control"/>
                  <button
                   
                    type="submit"
                    disabled={resendForm.submitting} aria-busy={resendForm.submitting} class="action action-secondary"
                   
                  >
                    <Send class="size-4" />
                    {resendForm.submitting ? t('verify.resending') : t('verify.resend')}
                  </button>
                </div>
                <Show when={field.error}>
                  <span role="alert" class="field-error">{field.error}</span>
                </Show>
              </>
            )}
          </FormField>
        </Field>
        <Show when={message() && status() === 'idle'}>
          <p role="status" class="text-caption">
            {message()}
          </p>
        </Show>
      </Form>
      <div class="mt-4">
        <a href={routes.auth.signIn} class="action action-secondary">
          <LogIn class="size-4" /> {t('common.backToLogin')}
        </a>
      </div>
    </div>
  );
}

export default VerifyEmailNotice;
