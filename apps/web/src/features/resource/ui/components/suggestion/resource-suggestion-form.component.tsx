import { createSignal, Show } from 'solid-js';
import { createForm, reset } from '@modular-forms/solid';
import { suggestResource } from '@/features/resource/actions/resource.action.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/resource/i18n';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createResourceSuggestionSchema } from '@/features/resource/ui/schemas/suggestion.schema.ts';
import type { ResourceSuggestionFormInput } from '@/features/resource/ui/schemas/suggestion.schema.ts';
import { Send } from 'lucide-solid';

function ResourceSuggestionForm() {
  const { t, locale } = useI18n();
  const schema = createResourceSuggestionSchema(locale());
  const [message, setMessage] = createSignal('');
  const [succeeded, setSucceeded] = createSignal(false);
  const [form, { Form, Field }] = createForm<ResourceSuggestionFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
  });

  const submit = async (values: ResourceSuggestionFormInput) => {
    const url = values.url.trim();
    if (!url || form.submitting) return;

    setMessage('');
    setSucceeded(false);
    try {
      const success = (await suggestResource({ url })).kind === 'success';
      setSucceeded(success);
      setMessage(
        success ? t('resourcesuggestionform.urlSubmittedReview') : t('resourcesuggestionform.couldNotSendUrl'),
      );
      if (success) reset(form);
    } catch {
      setMessage(t('resourcesuggestionform.couldNotSendUrl'));
    }
  };

  return (
    <Form onSubmit={submit} class="space-y-3">
      <div class="grid gap-2">
        <label for="resource-suggestion-url" class="field-label sr-only">
          {t('resourcesuggestionform.urlResource')}
        </label>
        <Field name="url">
          {(field, fieldProps) => (
            <>
              <input
                {...fieldProps}
                id="resource-suggestion-url"
                type="url"
                value={field.value ?? ''}
                placeholder="https://exemplo.com"
               class="field-control"/>
              {field.error && <span role="alert" class="field-error">{field.error}</span>}
            </>
          )}
        </Field>
      </div>
      <button type="submit" disabled={form.submitting} class="action action-primary">
        <Send class="size-4" />
        {form.submitting ? t('resource.sending') : t('resources.sendResource')}
      </button>
      <Show when={message()}>
        <p class={succeeded() ? 'text-xs text-success' : 'text-xs text-danger'} role="status">
          {message()}
        </p>
      </Show>
    </Form>
  );
}

export default withLocale(ResourceSuggestionForm);
