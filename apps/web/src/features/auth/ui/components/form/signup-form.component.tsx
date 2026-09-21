import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createAuthSchemas, signupSchema as defaultSignupSchema } from '@/features/auth/ui/schemas/forms.schema.ts';
import PasswordInput from '@/shared/ui/components/forms/password-input.component.tsx';
import type { z } from 'zod';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { useI18n } from '@/features/auth/i18n';
import { LogIn, Mail, MailCheck, UserPlus } from 'lucide-solid';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { routes } from '@/shared/navigation/routes';
import type { Locale } from '@/shared/i18n/core';
import { createSignal, onMount, Show } from 'solid-js';
import { clearError, createForm, setError, setValue } from '@modular-forms/solid';
type SignupFormValues = z.input<typeof defaultSignupSchema>;

function SignupForm(props: { locale: Locale }) {
  const { t } = useI18n(props.locale);
  const { register, resendVerification } = useAuth();
  const signupSchema = createAuthSchemas(props.locale).signup;
  const [signupForm, { Form, Field: FormField }] = createForm<SignupFormValues>({
    validate: zodForm(signupSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const [verificationEmail, setVerificationEmail] = createSignal('');
  const [verificationActive, setVerificationActive] = createSignal(false);
  const [resendingVerification, setResendingVerification] = createSignal(false);
  const [verificationMessage, setVerificationMessage] = createSignal<string | null>(null);
  const [ready, setReady] = createSignal(false);

  onMount(() => setReady(true));

  const handleSubmit = async (values: SignupFormValues) => {
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setError(signupForm, 'email', t('common.invalidData'), { shouldTouched: true, shouldDirty: true });
      return;
    }
    const result = await register(parsed.data);
    if (!result) {
      setError(signupForm, 'email', resolveMessage('DEFAULT_ERROR', props.locale), {
        shouldTouched: true,
        shouldDirty: true,
      });
      return;
    }
    setVerificationEmail(parsed.data.email);
    setVerificationActive(true);
  };

  const resendVerificationEmail = async () => {
    const value = verificationEmail().trim().toLowerCase();
    if (!value) return;
    setResendingVerification(true);
    setVerificationMessage(null);
    const ok = await resendVerification({ email: value });
    setVerificationMessage(ok ? t('signup.newLink') : t('signup.resendError'));
    setResendingVerification(false);
  };

  return (
    <>
      <Show when={!verificationActive()}>
        <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field>
            <label for="signup-email" class="field-label">{t('common.email')}</label>
            <FormField name="email">
              {(field, fieldProps) => (
                <>
                  <input
                    {...fieldProps}
                    id="signup-email"
                    type="email"
                    autocomplete="email"
                    placeholder={t('common.emailPlaceholder')}
                    value={field.value ?? ''}
                    disabled={!ready()}
                    aria-invalid={Boolean(field.error)}
                    onInput={(event) => {
                      fieldProps.onInput(event);
                      clearError(signupForm, 'email');
                    }}
                   class="field-control"/>
                  <div class="flex items-center justify-end text-xs text-content-muted">
                    <span>{String(field.value ?? '').length}/255</span>
                  </div>
                  <Show when={field.error}>
                    <span role="alert" class="field-error">{field.error}</span>
                  </Show>
                </>
              )}
            </FormField>
          </Field>
          <Field>
            <label for="signup-password" class="field-label">{t('common.password')}</label>
            <FormField name="password">
              {(field) => (
                <>
                  <PasswordInput
                    id="signup-password"
                    name="password"
                    autocomplete="new-password"
                    placeholder={t('signup.createPassword')}
                    value={field.value ?? ''}
                    disabled={!ready()}
                    onValueChange={(value) =>
                      setValue(signupForm, 'password', value, {
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
            <label for="signup-confirm" class="field-label">{t('common.confirmPassword')}</label>
            <FormField name="confirmPassword">
              {(field) => (
                <>
                  <PasswordInput
                    id="signup-confirm"
                    name="confirmPassword"
                    autocomplete="new-password"
                    placeholder={t('reset.repeatPassword')}
                    value={field.value ?? ''}
                    disabled={!ready()}
                    onValueChange={(value) =>
                      setValue(signupForm, 'confirmPassword', value, {
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
            disabled={!ready() || signupForm.submitting} aria-busy={signupForm.submitting} class="action action-primary"
           
          >
            <UserPlus class="size-4" /> {signupForm.submitting ? t('signup.creating') : t('signup.create')}
          </button>
          <div class="mt-2 flex flex-wrap items-center justify-between text-xs text-content-muted">
            <a href={routes.auth.signIn} class="inline-flex items-center gap-2 font-semibold text-content">
              <LogIn class="size-4" /> {t('signup.haveAccount')}
            </a>
          </div>
        </Form>
      </Show>
      <Show when={verificationActive()}>
        <section class="rounded-2xl border border-line bg-surface p-4" aria-labelledby="signup-verification-heading">
          <div class="flex items-start gap-3">
            <MailCheck class="mt-0.5 size-5 shrink-0 text-content-accent" />
            <div>
              <h2 id="signup-verification-heading" class="heading-callout text-sm">
                {t('signup.verifyTitle')}
              </h2>
              <p class="text-muted-compact mt-1">
                {t('signup.verifyPrefix')} <strong>{verificationEmail()}</strong>. {t('signup.verifySuffix')}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={resendingVerification()}
           
            onClick={() => void resendVerificationEmail()} aria-busy={resendingVerification()} class="action action-secondary"
           
          >
            <Mail class="size-4" />
            {resendingVerification() ? t('signup.resending') : t('signup.resend')}
          </button>
          <Show when={verificationMessage()}>
            <p role="status" aria-live="polite" class="text-caption mt-2">
              {verificationMessage()}
            </p>
          </Show>
        </section>
      </Show>
    </>
  );
}

export default SignupForm;
