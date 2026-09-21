import Field from '@/shared/ui/components/forms/field.component.tsx';
import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import Alert from '@/shared/ui/components/feedback/alert.component.tsx';
import { createMemo, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createForm, reset } from '@modular-forms/solid';
import { reactivateAccount } from '@/features/account/actions/account-lifecycle.action.ts';
import { verifyMfaRecoveryCode, verifyMfaTotp } from '@/features/auth/public/mfa';
import { notifySessionAvailable } from '@/shared/api';
import { useI18n } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { routes } from '@/shared/navigation/routes';
import { Check, KeyRound } from 'lucide-solid';
import { createAccountLifecycleSchemas, type ReactivationCodeFormInput } from '@/features/account/ui/schemas/lifecycle.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';
function AccountReactivation(props: { token: string; locale: Locale }) {
  const { t } = useI18n(props.locale);
  const schemas = createAccountLifecycleSchemas(props.locale);
  const [state, setState] = createStore({
    phase: 'loading' as 'loading' | 'mfa' | 'error',
    mfaToken: '',
    methods: [] as string[],
    pending: null as 'totp' | 'recovery' | null,
    challengeError: false,
  });
  const [totpForm, { Form: TotpForm, Field: TotpField }] = createForm<ReactivationCodeFormInput>({
    validate: zodForm(schemas.totp),
  });
  const [recoveryForm, { Form: RecoveryForm, Field: RecoveryField }] = createForm<ReactivationCodeFormInput>({
    validate: zodForm(schemas.recovery),
  });
  const canUseTotp = createMemo(() => state.methods.length === 0 || state.methods.includes('totp'));
  const canUseRecovery = createMemo(() => state.methods.length === 0 || state.methods.includes('recovery_code'));

  const authenticated = () => {
    notifySessionAvailable();
    redirectTo(routes.account.root);
  };

  onMount(async () => {
    if (!props.token) {
      setState('phase', 'error');
      return;
    }
    const result = await reactivateAccount(props.token);
    if (result.kind === 'failure') {
      setState('phase', 'error');
      return;
    }
    if (result.kind === 'mfa-required') {
      setState({ phase: 'mfa', mfaToken: result.token, methods: result.methods, pending: null, challengeError: false });
      return;
    }
    authenticated();
  });

  const finishTotp = async (values: ReactivationCodeFormInput) => {
    if (state.pending) return;
    setState({ pending: 'totp', challengeError: false });
    const result = await verifyMfaTotp(state.mfaToken, values.code.trim());
    setState('pending', null);
    if (result.error) {
      setState('challengeError', true);
      return;
    }
    reset(totpForm);
    authenticated();
  };

  const finishRecovery = async (values: ReactivationCodeFormInput) => {
    if (state.pending) return;
    setState({ pending: 'recovery', challengeError: false });
    const result = await verifyMfaRecoveryCode(state.mfaToken, values.code.trim());
    setState('pending', null);
    if (result.error) {
      setState('challengeError', true);
      return;
    }
    reset(recoveryForm);
    authenticated();
  };

  return (
    <Surface variant="elevated" padding="lg" aria-live="polite" aria-busy={state.phase === 'loading'}>
      <Show when={state.phase === 'loading'}>
        <p class="text-muted">{t('lifecycle.reactivationLoading')}</p>
      </Show>
      <Show when={state.phase === 'mfa'}>
        <fieldset class="space-y-4">
          <legend class="text-2xl font-semibold">{t('lifecycle.reactivationTitle')}</legend>
          <p class="text-muted">{t('lifecycle.reactivationBody')}</p>
          <Show when={state.challengeError}>
            <Alert status="danger">{t('lifecycle.reactivationError')}</Alert>
          </Show>
          <Show when={canUseTotp()}>
            <TotpForm onSubmit={finishTotp} class="grid gap-4">
              <TotpField name="code">
                {(field, fieldProps) => (
                  <Field>
                    <label for="reactivation-totp" class="field-label">{t('lifecycle.reactivationTotp')}</label>
                    <input
                      {...fieldProps}
                      id="reactivation-totp"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      value={field.value ?? ''}
                     class="field-control"/>
                    {field.error ? <span role="alert" class="field-error">{field.error}</span> : null}
                  </Field>
                )}
              </TotpField>
              <button
               
                type="submit"
                disabled={state.pending !== null} aria-busy={state.pending === 'totp'} class="action action-primary"
               
              >
                <Check class="size-4" aria-hidden="true" />
                {state.pending === 'totp' ? t('lifecycle.reactivationLoading') : t('lifecycle.reactivationConfirm')}
              </button>
            </TotpForm>
          </Show>
          <Show when={canUseRecovery()}>
            <RecoveryForm onSubmit={finishRecovery} class="grid gap-4">
              <RecoveryField name="code">
                {(field, fieldProps) => (
                  <Field>
                    <label for="reactivation-recovery" class="field-label">{t('lifecycle.reactivationRecovery')}</label>
                    <input
                      {...fieldProps}
                      id="reactivation-recovery"
                      autocomplete="one-time-code"
                      spellcheck={false}
                      value={field.value ?? ''}
                     class="field-control"/>
                    {field.error ? <span role="alert" class="field-error">{field.error}</span> : null}
                  </Field>
                )}
              </RecoveryField>
              <button
               
                type="submit"
                disabled={state.pending !== null} aria-busy={state.pending === 'recovery'} class="action action-secondary"
               
              >
                <KeyRound class="size-4" aria-hidden="true" />
                {t('lifecycle.reactivationUseRecovery')}
              </button>
            </RecoveryForm>
          </Show>
        </fieldset>
      </Show>
      <Show when={state.phase === 'error'}>
        <div class="space-y-4" role="alert">
          <p class="text-body">{t('lifecycle.reactivationError')}</p>
          <a href={routes.auth.signIn} class="action action-secondary">
            {t('lifecycle.reactivationLogin')}
          </a>
        </div>
      </Show>
    </Surface>
  );
}

export default AccountReactivation;
