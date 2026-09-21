import Field from '@/shared/ui/components/forms/field.component.tsx';
import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { createEffect, createSignal, Show } from 'solid-js';
import { createForm, getValue, reset, setValue } from '@modular-forms/solid';
import QRCode from 'qrcode';
import { Check, KeyRound, RefreshCw, ShieldOff, X } from 'lucide-solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { createMfaSchemas, type DisableMfaFormInput, type TotpEnrollmentFormInput } from '@/features/account/ui/schemas/mfa.schema.ts';
interface Props {
  enabled: boolean;
  enrollment: { secret: string; otpauthUri: string; status: 'pending' } | null;
  busy: boolean;
  disableOpen: boolean;
  onStart: () => void;
  onComplete: (input: TotpEnrollmentFormInput) => void;
  onOpenDisable: () => void;
  onCloseDisable: () => void;
  onDisable: (input: DisableMfaFormInput) => void;
  onRegenerate: () => void;
}

export default function TotpProtectionSettings(props: Props) {
  const { t, locale } = useI18n();
  const [qrCode, setQrCode] = createSignal<string | null>(null);
  const [enrollmentForm, { Form: EnrollmentForm, Field: EnrollmentField }] = createForm<TotpEnrollmentFormInput>({
    validate: zodForm(createMfaSchemas(locale()).totpEnrollment),
  });
  const [disableForm, { Form: DisableForm, Field: DisableField }] = createForm<DisableMfaFormInput>({
    initialValues: { method: 'totp', code: '' },
    validate: zodForm(createMfaSchemas(locale()).disable),
  });

  createEffect(() => {
    const uri = props.enrollment?.otpauthUri;
    if (!uri) {
      setQrCode(null);
      reset(enrollmentForm);
      return;
    }

    void QRCode.toDataURL(uri, {
      width: 240,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#f4f7f8',
        light: '#00000000',
      },
    })
      .then(setQrCode)
      .catch(() => setQrCode(null));
  });

  const closeDisable = () => {
    reset(disableForm);
    props.onCloseDisable();
  };

  const disable = (input: DisableMfaFormInput) => {
    props.onDisable(input);
  };

  return (
    <Surface id="mfa-totp" padding="sm">
      <p class="text-strong">{t('accountoverview.authenticationTwoFactors')}</p>
      <p class="text-caption mt-1">
        {t('securitysection.status')}{' '}
        {props.enabled ? t('security.totpActive') : t('securitysection.totpNotConfigured')}
      </p>

      <Show when={!props.enabled && !props.enrollment}>
        <div class="mt-4">
          <button type="button" disabled={props.busy} onClick={props.onStart} class="action action-primary">
            <KeyRound class="size-4" />
            {t('securitysection.configureTotp')}
          </button>
        </div>
      </Show>

      <Show when={props.enrollment}>
        {(enrollment) => (
          <EnrollmentForm onSubmit={props.onComplete} class="mt-4 flex flex-col gap-3 text-sm text-content">
            <p class="text-body">{t('securitysection.addThisKeyAuthenticator')}</p>
            <Show when={qrCode()}>
              {(src) => (
                <div class="inline-flex self-center rounded-2xl border border-line bg-surface-subtle p-4 shadow-sm">
                  <img src={src()} alt={t('securitysection.qrCodeAlt')} width="240" height="240" class="rounded-lg" />
                </div>
              )}
            </Show>
            <code class="break-all rounded-xl bg-surface-subtle px-3 py-2 text-xs">{enrollment().secret}</code>
            <p class="text-caption">
              {t('securitysection.uri')} {enrollment().otpauthUri}
            </p>
            <EnrollmentField name="code">
              {(field, fieldProps) => (
                <Field invalid={Boolean(field.error)}>
                  <label for="totp-enrollment-code" class="field-label">{t('securitysection.codeTotp')}</label>
                  <input
                    {...fieldProps}
                    id="totp-enrollment-code"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    value={field.value ?? ''}
                    aria-invalid={Boolean(field.error)}
                   class="field-control"/>
                  {field.error ? <p class="text-danger">{field.error}</p> : null}
                </Field>
              )}
            </EnrollmentField>
            <button type="submit" disabled={props.busy} aria-busy={props.busy} class="action action-primary">
              <Check class="size-4" />
              {t('securitysection.confirmTotp')}
            </button>
          </EnrollmentForm>
        )}
      </Show>

      <Show when={props.enabled}>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={props.busy} onClick={props.onOpenDisable} class="action action-secondary">
            <ShieldOff class="size-4" />
            {t('securitysection.disableTotp')}
          </button>
          <button type="button" disabled={props.busy} onClick={props.onRegenerate} class="action action-secondary">
            <RefreshCw class="size-4" />
            {t('securitysection.regenerateRecoveryCodes')}
          </button>
        </div>

        <Show when={props.disableOpen}>
          <DisableForm
            onSubmit={disable}
            class="mt-4 grid gap-3 rounded-2xl border border-danger-border bg-danger-bg p-4"
          >
            <p class="text-strong">{t('auth.disableMfa.title')}</p>
            <p class="text-caption">{t('auth.disableMfa.description')}</p>
            <DisableField name="method">
              {(field) => (
                <div class="flex flex-wrap gap-2" role="group" aria-label={t('auth.disableMfa.methodLabel')}>
                  <ToggleButton
                    pressed={(field.value ?? 'totp') === 'totp'}
                    onClick={() => setValue(disableForm, 'method', 'totp')}
                    class="rounded-full"
                  >
                    {t('auth.disableMfa.totp')}
                  </ToggleButton>
                  <ToggleButton
                    pressed={field.value === 'recovery_code'}
                    onClick={() => setValue(disableForm, 'method', 'recovery_code')}
                    class="rounded-full"
                  >
                    {t('auth.disableMfa.recovery')}
                  </ToggleButton>
                </div>
              )}
            </DisableField>
            <DisableField name="code">
              {(field, fieldProps) => (
                <Field invalid={Boolean(field.error)}>
                  <label for="disable-mfa-proof" class="field-label">
                    {(getValue(disableForm, 'method') ?? 'totp') === 'totp'
                      ? t('auth.disableMfa.totpCode')
                      : t('auth.disableMfa.recoveryCode')}
                  </label>
                  <input
                    {...fieldProps}
                    id="disable-mfa-proof"
                    autocomplete="one-time-code"
                    value={field.value ?? ''}
                    aria-invalid={Boolean(field.error)}
                   class="field-control"/>
                  {field.error ? <p class="text-danger">{field.error}</p> : null}
                </Field>
              )}
            </DisableField>
            <div class="flex flex-wrap gap-2">
              <button type="submit" disabled={props.busy} aria-busy={props.busy} class="action action-danger">
                <ShieldOff class="size-4" />
                {t('auth.disableMfa.confirm')}
              </button>
              <button type="button" disabled={props.busy} onClick={closeDisable} class="action action-secondary">
                <X class="size-4" />
                {t('auth.disableMfa.cancel')}
              </button>
            </div>
          </DisableForm>
        </Show>
      </Show>
    </Surface>
  );
}
