import { createSignal, Show } from 'solid-js';
import { createForm, reset } from '@modular-forms/solid';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { submitNewsSuggestion } from '@/features/news/actions/news.action.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/news/i18n';
import { createNewsSuggestionSchema, type NewsSuggestionFormInput } from '@/features/news/ui/schemas/forms.schema.ts';
import { Send } from 'lucide-solid';

function NewsSuggestionForm() {
  const { t, locale } = useI18n();
  const [message, setMessage] = createSignal('');
  const [succeeded, setSucceeded] = createSignal(false);
  const [form, { Form, Field: FormField }] = createForm<NewsSuggestionFormInput>({
    validate: zodForm(createNewsSuggestionSchema(locale())),
    validateOn: 'submit',
  });

  const submit = async (values: NewsSuggestionFormInput) => {
    if (form.submitting) return;
    setMessage('');
    setSucceeded(false);
    try {
      const result = await submitNewsSuggestion(values.url.trim());
      const success = result.kind === 'success';
      setSucceeded(success);
      setMessage(
        success ? t('newssuggestionform.suggestionSubmittedReview') : t('newssuggestionform.couldNotSendSuggestion'),
      );
      if (success) reset(form);
    } catch {
      setMessage(t('newssuggestionform.couldNotSendSuggestion'));
    }
  };

  return (
    <Form onSubmit={submit} class="grid gap-4">
      <Field>
        <label for="news-suggestion-url" class="field-label">{t('newssuggestionform.urlNews')}</label>
        <FormField name="url">
          {(field, fieldProps) => (
            <>
              <input
                {...fieldProps}
                id="news-suggestion-url"
                type="url"
                value={field.value ?? ''}
                required
                placeholder="https://..."
               class="field-control"/>
              <Show when={field.error}>
                <span class="text-xs text-danger">{field.error}</span>
              </Show>
            </>
          )}
        </FormField>
      </Field>
      <div class="flex justify-end">
        <button type="submit" disabled={form.submitting} class="action action-primary">
          <Send class="size-4" />
          {form.submitting ? t('newssuggestionform.sending') : t('newssuggestionform.send')}
        </button>
      </div>
      <Show when={message()}>
        <p class={succeeded() ? 'text-sm text-success' : 'text-sm text-danger'} role="status">
          {message()}
        </p>
      </Show>
    </Form>
  );
}

export default withLocale(NewsSuggestionForm);
