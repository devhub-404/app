import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { Show } from 'solid-js';
import { createForm, setValue } from '@modular-forms/solid';
import { useI18n } from '@/features/account/i18n';
import { createMfaSchemas } from '@/features/account/ui/schemas/mfa.schema.ts';
import type { PossessionProofInput } from '@/features/account/ui/hooks/use-possession-proof-flow.hook.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { Check, Mail } from 'lucide-solid';
import { Dialog } from '@ark-ui/solid/dialog';
interface Props {
  busy: boolean;
  proofSent: boolean;
  reauthRequired: boolean;
  mfaRequired?: boolean;
  error?: string | null;
  onRequest: () => void;
  onConfirm: (input: PossessionProofInput) => void;
  onClose: () => void;
}

/** Contextual step-up UI. It is rendered only after a protected operation asks for proof. */
export default function PossessionProofStep(props: Props) {
  const { t, locale } = useI18n();
  const [form, { Form, Field: FormField }] = createForm<PossessionProofInput>({
    initialValues: { code: '', method: 'totp' },
    validate: zodForm(createMfaSchemas(locale()).disable),
  });

  return (
    <Dialog.Root open={true} onOpenChange={(details) => !details.open && props.onClose()}>
      <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
      <Dialog.Positioner class="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
        <Dialog.Content class="grid w-full max-w-md gap-5 rounded-3xl border border-line bg-surface-elevated p-6 shadow-ui-overlay">
          <Dialog.Title class="text-lg font-semibold text-content">
            {t('securitysection.proofRecentPossession')}
          </Dialog.Title>
          <Dialog.Description class="text-sm text-content-muted">
            {t('securitysection.requestCodeEmailPrimaryOnlyWhenOperationAcceptThisWay')}
          </Dialog.Description>
          <Show when={!props.mfaRequired}>
            <div class="mt-5">
              <button type="button" disabled={props.busy} onClick={props.onRequest} class="action action-secondary">
                <Mail class="size-4" />
                {t('securitysection.sendCodeEmail')}
              </button>
            </div>
          </Show>
          <Show when={props.reauthRequired}>
            <p class="text-danger-caption mt-3">
              {t('securitysection.thisAccountUsesMfaOperationSensitiveReauthenticateMfaEmailAlone')}
            </p>
          </Show>
          <Show when={props.error}>
            {(message) => (
              <p role="alert" class="text-danger mt-3">
                {message()}
              </p>
            )}
          </Show>
          <Show when={props.proofSent || props.mfaRequired}>
            <Form onSubmit={props.onConfirm} class="mt-3 grid gap-3">
              <Show when={props.mfaRequired}>
                <FormField name="method">
                  {(field) => (
                    <Field>
                      <label for="possession-mfa-method" class="field-label">{t('auth.disableMfa.methodLabel')}</label>
                      <Select<'totp' | 'recovery_code'>
                        id="possession-mfa-method"
                        value={field.value ?? 'totp'}
                        ariaLabel={t('auth.disableMfa.methodLabel')}
                        options={[
                          { value: 'totp', label: t('auth.disableMfa.totp') },
                          { value: 'recovery_code', label: t('auth.disableMfa.recovery') },
                        ]}
                        onChange={(value) => setValue(form, 'method', value)}
                      />
                    </Field>
                  )}
                </FormField>
              </Show>
              <FormField name="code">
                {(field, fieldProps) => (
                  <Field invalid={Boolean(field.error)}>
                    <label for="possession-proof-code" class="field-label">{t('passwordsection.codeReceived')}</label>
                    <input
                      {...fieldProps}
                      id="possession-proof-code"
                      autocomplete="one-time-code"
                      inputmode={props.mfaRequired ? 'text' : 'numeric'}
                      value={field.value ?? ''}
                      aria-invalid={Boolean(field.error)}
                     class="field-control"/>
                    {field.error ? <p class="text-danger">{field.error}</p> : null}
                  </Field>
                )}
              </FormField>
              <button type="submit" disabled={props.busy} aria-busy={props.busy} class="action action-primary">
                <Check class="size-4" />
                {t('passwordsection.confirmProof')}
              </button>
            </Form>
          </Show>
          <Dialog.CloseTrigger
            asChild={(triggerProps) => (
              <button {...triggerProps} type="button" disabled={props.busy} class="action action-secondary">
                {t('myarticles.cancel')}
              </button>
            )}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
