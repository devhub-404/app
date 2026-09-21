import { Show } from 'solid-js';
import { createForm, setError, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createAuthSchemas } from '@/features/auth/ui/schemas/forms.schema.ts';
import PasswordInput from '@/shared/ui/components/forms/password-input.component.tsx';
import type { LoginInput, LoginResult } from '@/features/auth/types';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { useI18n } from '@/features/auth/i18n';
import { LogIn } from 'lucide-solid';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import { routes } from '@/shared/navigation/routes';
import type { ApiResult } from '@/shared/api';
import type { Locale } from '@/shared/i18n/core';
import Field from '@/shared/ui/components/forms/field.component.tsx';

interface Props {
  locale: Locale;
  onResult: (result: ApiResult<LoginResult>) => void;
  ready: boolean;
}

function LoginForm(props: Props) {
  const { t } = useI18n(props.locale);
  const { login } = useAuth();
  const loginSchema = createAuthSchemas(props.locale).login;
  const [loginForm, { Form, Field: FormField }] = createForm<LoginInput>({
    validate: zodForm(loginSchema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const handleSubmit = async (values: LoginInput) => {
    const result = await login(values);
    if (result.error) {
      setError(
        loginForm,
        'email',
        resolveMessage(result.error.code, props.locale) ||
          resolveMessage('DEFAULT_ERROR', props.locale) ||
          t('login.error'),
        { shouldTouched: true, shouldDirty: true },
      );
      return;
    }
    props.onResult(result);
  };

  return (
    <Form class="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field>
        <label for="login-email" class="field-label">{t('common.email')}</label>
        <FormField name="email">
          {(field, fieldProps) => (
            <>
              <input
                {...fieldProps}
                id="login-email"
                type="email"
                autocomplete="email"
                value={field.value ?? ''}
                disabled={!props.ready}
                aria-invalid={Boolean(field.error)}
               class="field-control"/>
              <Show when={field.error}>
                <span role="alert" class="field-error">{field.error}</span>
              </Show>
            </>
          )}
        </FormField>
      </Field>

      <Field>
        <label for="login-password" class="field-label">{t('common.password')}</label>
        <FormField name="password">
          {(field) => (
            <>
              <PasswordInput
                id="login-password"
                name="password"
                autocomplete="current-password"
                value={field.value ?? ''}
                disabled={!props.ready}
                onValueChange={(value) =>
                  setValue(loginForm, 'password', value, {
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
        disabled={!props.ready || loginForm.submitting} aria-busy={loginForm.submitting} class="action action-primary"
       
      >
        <LogIn class="size-4" />
        {loginForm.submitting ? t('login.signingIn') : t('login.signIn')}
      </button>

      <div class="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-content-muted">
        <a href={routes.auth.forgotPassword} class="font-semibold text-content">
          {t('login.forgotPassword')}
        </a>
        <a href={routes.auth.signUp} class="font-semibold text-content">
          {t('login.createAccount')}
        </a>
      </div>
    </Form>
  );
}

export default LoginForm;
