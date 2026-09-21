import { createForm } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { authenticationOutcomeFromResult, type AuthenticationOutcome } from '@/features/auth/types';
import { useI18n } from '@/features/auth/i18n';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
import type { Locale } from '@/shared/i18n/core';
import { Check, KeyRound, Power } from 'lucide-solid';
import { createAuthSchemas } from '@/features/auth/ui/schemas/forms.schema.ts';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createMemo, createSignal, Show } from 'solid-js';
import { reactivateAccount } from '@/features/account/public';
interface Props {
  outcome: AuthenticationOutcome;
  locale: Locale;
  onChange: (outcome: AuthenticationOutcome) => void;
  onAuthenticated: (redirect?: string | null) => void;
}

function AuthenticationContinuation(props: Props) {
  const { t } = useI18n(props.locale);
  const { verifyMfaTotp, verifyMfaRecoveryCode } = useAuth();
  const schemas = createAuthSchemas(props.locale);
  const [totpForm, { Form: TotpForm, Field: TotpField }] = createForm<{ code: string }>({
    validate: zodForm(schemas.mfaTotp),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const [recoveryForm, { Form: RecoveryForm, Field: RecoveryField }] = createForm<{ code: string }>({
    validate: zodForm(schemas.mfaRecovery),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const [pending, setPending] = createSignal<'reactivation' | 'totp' | 'recovery' | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  const methods = createMemo(() => (props.outcome.kind === 'mfa' ? props.outcome.methods : []));
  const canUseTotp = createMemo(() => methods().includes('totp'));
  const canUseRecovery = createMemo(() => methods().includes('recovery_code'));

  const errorMessage = (code?: string, fallback?: string) =>
    resolveMessage(code, props.locale) || fallback || t('continuation.error');

  const applyResult = (result: ReturnType<typeof authenticationOutcomeFromResult>) => {
    if (result.kind === 'error') {
      setError(errorMessage(result.code, result.message));
      return;
    }
    if (result.kind === 'authenticated') {
      props.onAuthenticated(result.redirect);
      return;
    }
    setError(null);
    props.onChange(result);
  };

  const reactivate = async () => {
    if (props.outcome.kind !== 'reactivation' || pending()) return;
    setPending('reactivation');
    setError(null);
    const result = await reactivateAccount(props.outcome.token);
    if (result.kind === 'failure') {
      setError(errorMessage(result.code));
    } else if (result.kind === 'mfa-required') {
      setError(null);
      props.onChange({
        kind: 'mfa',
        token: result.token,
        methods: result.methods,
        redirect: props.outcome.redirect,
      });
    } else {
      props.onAuthenticated(props.outcome.redirect);
    }
    setPending(null);
  };

  const verifyTotp = async (values: { code: string }) => {
    if (props.outcome.kind !== 'mfa' || pending()) return;
    setPending('totp');
    setError(null);
    const result = await verifyMfaTotp(props.outcome.token, values.code.trim());
    if (result.error) {
      applyResult({ kind: 'error', code: result.error.code, message: result.error.message });
    } else {
      props.onAuthenticated(props.outcome.redirect);
    }
    setPending(null);
  };

  const verifyRecovery = async (values: { code: string }) => {
    if (props.outcome.kind !== 'mfa' || pending()) return;
    setPending('recovery');
    setError(null);
    const result = await verifyMfaRecoveryCode(props.outcome.token, values.code.trim());
    applyResult(authenticationOutcomeFromResult(result));
    setPending(null);
  };

  return (
    <div class="space-y-4" aria-live="polite">
      <Show when={props.outcome.kind === 'email-verification-requested'}>
        <div class="rounded-2xl border border-action-border bg-action-subtle p-4 text-sm text-content" role="status">
          <p class="text-strong">{t('continuation.emailVerificationTitle')}</p>
          <p class="text-muted mt-1">
            {t('continuation.emailVerificationBody')}
          </p>
        </div>
      </Show>

      <Show when={props.outcome.kind === 'restore-requested'}>
        <div class="rounded-2xl border border-action-border bg-action-subtle p-4 text-sm text-content" role="status">
          <p class="text-strong">{t('continuation.restoreTitle')}</p>
          <p class="text-muted mt-1">
            {t('continuation.restoreBody')}
          </p>
        </div>
      </Show>

      <Show when={props.outcome.kind === 'reactivation'}>
        <div class="rounded-2xl border border-action-border bg-action-subtle p-4 text-sm text-content">
          <p class="text-strong">{t('continuation.reactivationTitle')}</p>
          <p class="text-muted mt-1">
            {t('continuation.reactivationBody')}
          </p>
          <div class="mt-4 grid">
            <button
             
              type="button"
              disabled={pending() !== null}
             
              onClick={() => void reactivate()} aria-busy={pending() === 'reactivation'} class="action action-primary"
            >
              <Power class="size-4" />
              {pending() === 'reactivation' ? t('continuation.reactivating') : t('continuation.reactivate')}
            </button>
          </div>
        </div>
      </Show>

      <Show when={props.outcome.kind === 'mfa'}>
        <fieldset class="rounded-2xl border border-action-border bg-action-subtle p-4 text-sm text-content">
          <legend class="px-1 font-semibold">{t('continuation.mfaTitle')}</legend>
          <p class="text-muted mt-1">
            {t('continuation.mfaBody')}
          </p>

          <Show when={canUseTotp()}>
            <TotpForm class="mt-4 space-y-2" onSubmit={verifyTotp}>
              <Field>
                <label for="auth-mfa-totp" class="field-label">{t('continuation.totp')}</label>
                <TotpField name="code">
                  {(field, fieldProps) => (
                    <>
                      <input
                        {...fieldProps}
                        id="auth-mfa-totp"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        value={field.value ?? ''}
                        aria-invalid={Boolean(field.error)}
                       class="field-control"/>
                      <Show when={field.error}>
                        <span role="alert" class="field-error">{field.error}</span>
                      </Show>
                    </>
                  )}
                </TotpField>
              </Field>
              <div class="grid">
                <button
                 
                  type="submit"
                  disabled={pending() !== null || totpForm.submitting} aria-busy={pending() === 'totp'} class="action action-primary"
                 
                >
                  <Check class="size-4" />
                  {pending() === 'totp' ? t('common.verifying') : t('continuation.confirmCode')}
                </button>
              </div>
            </TotpForm>
          </Show>

          <Show when={canUseRecovery()}>
            <RecoveryForm class="mt-5 space-y-2 border-t border-line pt-4" onSubmit={verifyRecovery}>
              <Field>
                <label for="auth-mfa-recovery" class="field-label">{t('continuation.recoveryCode')}</label>
                <RecoveryField name="code">
                  {(field, fieldProps) => (
                    <>
                      <input
                        {...fieldProps}
                        id="auth-mfa-recovery"
                        autocomplete="one-time-code"
                        spellcheck={false}
                        value={field.value ?? ''}
                        aria-invalid={Boolean(field.error)}
                       class="field-control"/>
                      <Show when={field.error}>
                        <span role="alert" class="field-error">{field.error}</span>
                      </Show>
                    </>
                  )}
                </RecoveryField>
              </Field>
              <div class="grid">
                <button
                 
                  type="submit"
                  disabled={pending() !== null || recoveryForm.submitting} aria-busy={pending() === 'recovery'} class="action action-secondary"
                 
                >
                  <KeyRound class="size-4" />
                  {pending() === 'recovery' ? t('common.verifying') : t('continuation.useRecovery')}
                </button>
              </div>
            </RecoveryForm>
          </Show>
        </fieldset>
      </Show>

      <Show when={props.outcome.kind === 'error' || error()}>
        <p role="alert" class="text-danger rounded-2xl border border-danger-border bg-danger-bg p-3">
          {error() ?? (props.outcome.kind === 'error' ? errorMessage(props.outcome.code, props.outcome.message) : '')}
        </p>
      </Show>
    </div>
  );
}

export default AuthenticationContinuation;
