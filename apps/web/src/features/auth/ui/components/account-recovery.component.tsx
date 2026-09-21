import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { createForm } from '@modular-forms/solid';
import { useI18n } from '@/features/auth/i18n';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import type { Locale } from '@/shared/i18n/core';
import { Mail, CircleCheck } from 'lucide-solid';
import { createAuthSchemas } from '@/features/auth/ui/schemas/forms.schema.ts';
import { createSignal, onMount, Show } from 'solid-js';
function AccountRecovery(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { startAccountRecovery, completeAccountRecovery } = useAuth();
  const [token, setToken] = createSignal('');
  const [completeBusy, setCompleteBusy] = createSignal(false);
  const [startForm, { Form, Field: FormField }] = createForm<{ email: string }>({
    validate: zodForm(createAuthSchemas(props.locale).accountRecoveryStart),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const [message, setMessage] = createSignal('');
  const [error, setError] = createSignal('');

  onMount(() => setToken(new URLSearchParams(location.search).get('token') ?? ''));

  const start = async (values: { email: string }) => {
    setError('');
    try {
      const result = await startAccountRecovery(values.email.trim());
      if (!result) setError(t('recovery.startError'));
      else setMessage(t('recovery.uniformAck'));
    } catch {
      setError(t('recovery.startError'));
    }
  };

  const complete = async () => {
    if (completeBusy()) return;
    setCompleteBusy(true);
    setError('');
    try {
      const result = await completeAccountRecovery({ token: token() });
      if (!result) setError(t('recovery.proofError'));
      else {
        setMessage(t('recovery.completed'));
        setTimeout(() => redirectTo(routes.auth.signIn), 1200);
      }
    } catch {
      setError(t('recovery.proofError'));
    } finally {
      setCompleteBusy(false);
    }
  };

  return (
    <div class="space-y-5">
      <Show
        when={token()}
        fallback={
          <Form class="space-y-4" onSubmit={start}>
            <p class="text-muted">{t('recovery.startBody')}</p>
            <Field>
              <label for="recovery-backup" class="field-label">{t('recovery.backupEmail')}</label>
              <FormField name="email">
                {(field, fieldProps) => (
                  <>
                    <input
                      {...fieldProps}
                      id="recovery-backup"
                      type="email"
                      autocomplete="email"
                      value={field.value ?? ''}
                      aria-invalid={Boolean(field.error)}
                     class="field-control"/>
                    <Show when={field.error}>
                      <span role="alert" class="field-error">{field.error}</span>
                    </Show>
                  </>
                )}
              </FormField>
            </Field>
            <button type="submit" disabled={startForm.submitting} aria-busy={startForm.submitting} class="action action-primary">
              <Mail class="size-4" />
              {startForm.submitting ? t('common.sending') : t('recovery.send')}
            </button>
          </Form>
        }
      >
        <div class="space-y-4">
          <p class="text-muted">{t('recovery.completeBody')}</p>
          <button
           
            type="button"
            disabled={completeBusy()}
           
            onClick={() => void complete()} aria-busy={completeBusy()} class="action action-primary"
          >
            <CircleCheck class="size-4" />
            {completeBusy() ? t('common.sending') : t('recovery.complete')}
          </button>
        </div>
      </Show>
      <Show when={message()}>
        <p role="status" class="text-body rounded-2xl border border-action-border bg-action-subtle p-4">
          {message()}
        </p>
      </Show>
      <Show when={error()}>
        <p role="alert" class="text-danger">
          {error()}
        </p>
      </Show>
      <a href={routes.auth.signIn} class="action action-secondary">
        {t('common.backToLogin')}
      </a>
    </div>
  );
}

export default AccountRecovery;
