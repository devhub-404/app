import { Show } from 'solid-js';
import { createForm, setResponse, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { sendContact } from '@/features/contact/actions/send-contact.action.ts';
import { useI18n } from '@/features/contact/i18n';

import { withLocale } from '@/shared/i18n/core/solid';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import { createContactFormSchema, type ContactFormInput } from '@/features/contact/ui/schemas/forms.schema.ts';
import { Send } from 'lucide-solid';

function ContactForm() {
  const { t, locale } = useI18n();
  const [form, { Form, Field: FormField }] = createForm<ContactFormInput>({
    initialValues: { type: 'support', name: '', email: '', subject: '', message: '' },
    validate: zodForm(createContactFormSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const submit = async (values: ContactFormInput) => {
    try {
      const result = await sendContact({
        ...values,
        name: values.name?.trim() || undefined,
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        contextUrl: window.location.href,
      });
      if (!result.ok) {
        setResponse(form, { status: 'error', message: t('contact.form.error') });
        return;
      }
      setResponse(form, { status: 'success', message: t('contact.form.success') });
    } catch {
      setResponse(form, { status: 'error', message: t('contact.form.error') });
    }
  };

  return (
    <Form onSubmit={submit} class="rounded-3xl border border-line bg-surface-elevated p-6 shadow-sm">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="grid gap-2">
          <label for="contact-type" class="field-label">{t('contact.form.reason')}</label>
          <FormField name="type">
            {(field) => (
              <Select<'support' | 'institutional' | 'legal'>
                id="contact-type"
                value={field.value ?? 'support'}
                ariaLabel={t('contact.form.reason')}
                options={[
                  { value: 'support', label: t('contact.form.support') },
                  { value: 'institutional', label: t('contact.form.institutional') },
                  { value: 'legal', label: t('contact.form.legal') },
                ]}
                onChange={(value) => setValue(form, 'type', value)}
              />
            )}
          </FormField>
        </div>
        <div class="grid gap-2">
          <label for="contact-name" class="field-label">
            {t('contact.form.name')}{' '}
            <span class="normal-case font-normal tracking-normal">({t('contact.form.optional')})</span>
          </label>
          <FormField name="name">
            {(_, props) => <input {...props} id="contact-name" maxlength={80} autocomplete="name"  class="field-control"/>}
          </FormField>
        </div>
        <div class="grid gap-2 sm:col-span-2">
          <label for="contact-email" class="field-label">
            {t('contact.form.email')}{' '}
            <span class="normal-case font-normal tracking-normal">({t('contact.form.requiredForReply')})</span>
          </label>
          <FormField name="email">
            {(field, props) => (
              <>
                <input {...props} id="contact-email" type="email" autocomplete="email"  class="field-control"/>
                {field.error && <span role="alert" class="field-error">{field.error}</span>}
              </>
            )}
          </FormField>
        </div>
        <div class="grid gap-2 sm:col-span-2">
          <label for="contact-subject" class="field-label">{t('contact.form.subject')}</label>
          <FormField name="subject">
            {(field, props) => (
              <>
                <input
                  {...props}
                  id="contact-subject"
                  minlength={3}
                  maxlength={160}
                  placeholder={t('contact.form.subjectPlaceholder')}
                 class="field-control"/>
                {field.error && <span role="alert" class="field-error">{field.error}</span>}
              </>
            )}
          </FormField>
        </div>
        <div class="grid gap-2 sm:col-span-2">
          <label for="contact-message" class="field-label">{t('contact.form.message')}</label>
          <FormField name="message">
            {(field, props) => (
              <>
                <textarea
                  {...props}
                  id="contact-message"
                  required
                  minlength={10}
                  maxlength={4000}
                  rows={8}
                  placeholder={t('contact.form.messagePlaceholder')}
                 class="field-control resize-y"/>
                {field.error && <span role="alert" class="field-error">{field.error}</span>}
              </>
            )}
          </FormField>
        </div>
      </div>
      <Show when={form.response.status}>
        {(status) => (
          <p
            role={status() === 'success' ? 'status' : 'alert'}
            class={`text-sm mt-4 rounded-2xl border p-4 ${status() === 'success' ? 'text-success border-success-border bg-success-bg' : 'text-danger border-danger-border bg-danger-bg'}`}
          >
            {form.response.message}
          </p>
        )}
      </Show>
      <div class="mt-5 flex items-center gap-3">
        <button disabled={form.submitting} aria-busy={form.submitting} class="action action-primary">
          <Send class="size-4" />
          {form.submitting ? t('contact.form.sending') : t('contact.form.send')}
        </button>
        <span class="text-xs text-content-muted">{t('contact.form.noSecrets')}</span>
      </div>
    </Form>
  );
}

export default withLocale(ContactForm);
