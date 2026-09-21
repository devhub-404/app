import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createEffect, createSignal, Show } from 'solid-js';
import { createForm, setError, setValue } from '@modular-forms/solid';
import { createAuthSchemas, resetPasswordSchema as defaultResetPasswordSchema } from '@/features/auth/ui/schemas/forms.schema.ts';
import PasswordInput from '@/shared/ui/components/forms/password-input.component.tsx';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import type { z } from 'zod';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { useI18n } from '@/features/auth/i18n';
import { KeyRound, MoveLeft } from 'lucide-solid';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { routes } from '@/shared/navigation/routes';
import type { Locale } from '@/shared/i18n/core';
type ResetPasswordFormValues = z.input<typeof defaultResetPasswordSchema>;

function ResetPasswordForm(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { resetPassword } = useAuth();
  const resetPasswordSchema = createAuthSchemas(props.locale).resetPassword;
  const [hasRecoveryToken, setHasRecoveryToken] = createSignal(false);
  const [resetForm, { Form, Field: FormField }] = createForm<ResetPasswordFormValues>({
    validate: zodForm(resetPasswordSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  createEffect(() => {
    if (typeof window === 'undefined') return;
    const tokenParam = new URLSearchParams(window.location.search).get('token');
    setHasRecoveryToken(Boolean(tokenParam));
    if (!tokenParam) return;
    setValue(resetForm, 'token', tokenParam, { shouldDirty: true, shouldTouched: true, shouldValidate: true });
  });

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      setError(resetForm, 'token', t('common.invalidData'), { shouldTouched: true, shouldDirty: true });
      return;
    }
    const result = await resetPassword({ token: parsed.data.verify.token, password: parsed.data.confirm.password });
    if (!result) {
      setError(resetForm, 'token', resolveMessage('DEFAULT_ERROR', props.locale), {
        shouldTouched: true,
        shouldDirty: true,
      });
      return;
    }
    redirectTo(routes.auth.signIn);
  };

  return (
    <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
      <FormField name="token">
        {(field, fieldProps) => <input {...fieldProps} type="hidden" value={field.value ?? ''} />}
      </FormField>
      <Show
        when={hasRecoveryToken()}
        fallback={
          <p role="alert" class="text-danger rounded-2xl border border-danger-border bg-danger-bg p-4">
            {t('reset.invalidProof')}
          </p>
        }
      >
        <p class="text-muted rounded-2xl border border-action-border bg-action-subtle p-4">
          {t('reset.proofReady')}
        </p>
      </Show>
      <Field>
        <label for="reset-password" class="field-label">{t('reset.newPassword')}</label>
        <FormField name="password">
          {(field) => (
            <>
              <PasswordInput
                id="reset-password"
                name="password"
                autocomplete="new-password"
                placeholder={t('reset.newPassword')}
                value={field.value ?? ''}
                onValueChange={(value) =>
                  setValue(resetForm, 'password', value, {
                    shouldDirty: true,
                    shouldTouched: true,
                    shouldValidate: true,
                  })
                }
              />
              <Show when={field.error}>
                <span role="alert" class="field-error">{field.error}</span>
              </Show>
            </>
          )}
        </FormField>
      </Field>
      <Field>
        <label for="reset-confirm" class="field-label">{t('common.confirmPassword')}</label>
        <FormField name="confirmPassword">
          {(field) => (
            <>
              <PasswordInput
                id="reset-confirm"
                name="confirmPassword"
                autocomplete="new-password"
                placeholder={t('reset.repeatPassword')}
                value={field.value ?? ''}
                onValueChange={(value) =>
                  setValue(resetForm, 'confirmPassword', value, {
                    shouldDirty: true,
                    shouldTouched: true,
                    shouldValidate: true,
                  })
                }
              />
              <Show when={field.error}>
                <span role="alert" class="field-error">{field.error}</span>
              </Show>
            </>
          )}
        </FormField>
      </Field>
      <button
       
        type="submit"
        disabled={resetForm.submitting || !hasRecoveryToken()} aria-busy={resetForm.submitting} class="action action-primary"
       
      >
        <KeyRound class="size-4" />
        {resetForm.submitting ? t('reset.updating') : t('reset.update')}
      </button>
      <div class="mt-2 text-xs text-content-muted">
        <a href={routes.auth.signIn} class="inline-flex items-center gap-2 font-semibold text-content">
          <MoveLeft class="size-4" /> {t('common.backToLogin')}
        </a>
      </div>
    </Form>
  );
}

export default ResetPasswordForm;
