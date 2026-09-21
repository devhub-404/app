import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createMagicLinkSchema, type MagicLinkFormInput } from '@/features/auth/ui/schemas/magic-link.schema.ts';
import { createSignal, Show } from 'solid-js';
import { createForm, setResponse } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { Mail } from 'lucide-solid';
import { useAuth } from '@/features/auth/ui/hooks/use-auth.hook.ts';
import { useI18n } from '@/features/auth/i18n';
import type { Locale } from '@/shared/i18n/core';
import { resolveMessage } from '@/shared/i18n/core/resolve-message';
interface Props {
  redirect: string;
  locale: Locale;
  ready: boolean;
}

function MagicLinkForm(props: Props) {
  const { t } = useI18n(props.locale);
  const { requestMagicLink } = useAuth();
  const schema = createMagicLinkSchema(props.locale);
  const [sent, setSent] = createSignal(false);
  const [_form, { Form, Field: FormField }] = createForm<MagicLinkFormInput>({
    initialValues: { email: '', redirect: props.redirect },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const submit = async (values: MagicLinkFormInput) => {
    setResponse(_form, { status: 'success', message: '' });
    try {
      const result = await requestMagicLink(values.email.trim(), props.redirect);
      if (result.error) {
        setResponse(_form, { status: 'error', message: resolveMessage(result.error.code, props.locale) || t('magic.requestError') });
        return;
      }
      setResponse(_form, { status: 'success', message: t('magic.uniformAck') });
      setSent(true);
    } catch {
      setResponse(_form, { status: 'error', message: t('magic.requestError') });
    }
  };

  return (
    <div class="flex flex-col gap-4">
      <Show
        when={!sent()}
        fallback={
          <p
           

            role="status"
            aria-live="polite" class="text-body rounded-2xl border border-action-border bg-action-subtle p-4"
           
          >
            {t('magic.uniformAck')}
          </p>
        }
      >
        <Form onSubmit={submit} class="flex flex-col gap-4">
          <Field>
            <label for="magic-email" class="field-label">{t('common.email')}</label>
            <FormField name="email">
              {(field, fieldProps) => (
                <>
                  <input {...fieldProps} id="magic-email" type="email" autocomplete="email" disabled={!props.ready}  class="field-control"/>
                  <Show when={field.error}>
                    <span role="alert" class="field-error">{field.error}</span>
                  </Show>
                </>
              )}
            </FormField>
          </Field>
          <Show when={_form.response.status === 'error'}>
            <p role="alert" class="text-danger">{_form.response.message}</p>
          </Show>
          <button type="submit" disabled={!props.ready || _form.submitting} aria-busy={_form.submitting} class="action action-primary">
            <Mail class="size-4" />
            {_form.submitting ? t('common.sending') : t('magic.send')}
          </button>
        </Form>
      </Show>
    </div>
  );
}

export default MagicLinkForm;
