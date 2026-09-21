import { Show } from 'solid-js';
import { createForm, setResponse, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createQuestion } from '@/features/q-and-a/actions/question.action.ts';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import MarkdownEditor from '@/shared/ui/editor/MarkdownEditorLoader';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/q-and-a/i18n';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { Send } from 'lucide-solid';
import { createQuestionFormSchema, type QuestionFormInput } from '@/features/q-and-a/ui/schemas/forms.schema.ts';

function NewQuestion() {
  const { t, locale } = useI18n();
  const [_form, { Form, Field: FormField }] = createForm<QuestionFormInput>({
    initialValues: { title: '', content: '', tagSlugs: [] },
    validate: zodForm(createQuestionFormSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const submit = async (values: QuestionFormInput) => {
    try {
      const result = await createQuestion({
        title: values.title.trim(),
        content: values.content.trim(),
        tagSlugs: values.tagSlugs ?? [],
      });
      const question = result.data?.data;
      if (question) redirectTo(routes.question(question.id));
      else setResponse(_form, { status: 'error', message: t('newquestion.couldNotCreateQuestion') });
    } catch {
      setResponse(_form, { status: 'error', message: t('newquestion.couldNotCreateQuestion') });
    }
  };

  return (
    <Form onSubmit={submit} class="space-y-6" aria-describedby="question-publication-rule">
      <header>
        <p class="text-accent-label">{t('newquestion.makeQuestion')}</p>
        <h1 class="heading-page mt-3">
          {t('newquestion.describeProblemContextEnoughOtherPeopleCanAnswer')}
        </h1>
      </header>
      <div class="space-y-6 rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm sm:p-6">
        <Field>
          <label for="question-title" class="field-label">{t('newquestion.title')}</label>
          <FormField name="title">
            {(field, props) => (
              <>
                <input
                  {...props}
                  id="question-title"
                  required
                  maxlength={180}
                  placeholder={t('newquestion.whichProblemYouNeedsSolve')}
                 class="field-control"/>
                <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
              </>
            )}
          </FormField>
          <p class="text-caption">{t('newquestion.useTitleSpecificCanBeUnderstoodWithoutOpenQuestion')}</p>
        </Field>

        <Field>
          <p class="text-field-heading">{t('newquestion.question')}</p>
          <FormField name="content">
            {(field) => (
              <>
                <MarkdownEditor
                  value={field.value ?? ''}
                  onChange={(value) => setValue(_form, 'content', value)}
                  placeholder={t('newquestion.includeContextAttemptsMessagesErrorResultExpected')}
                  ariaLabel={t('newquestion.contentQuestion')}
                />
                <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
              </>
            )}
          </FormField>
        </Field>

        <FormField name="tagSlugs" type="string[]">
          {(field) => (
            <>
              <TagSelector
                id="question-tags"
                value={field.value ?? []}
                onChange={(value) => {
                  setValue(_form, 'tagSlugs', value);
                }}
                max={5}
                label={t('newquestion.tags')}
                placeholder={t('newquestion.javascriptEventLoop')}
              />
              <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
            </>
          )}
        </FormField>
      </div>

      <aside id="question-publication-rule" class="text-sm text-content-muted">
        {t('newquestion.afterPublishedQuestionNotCanBeEditedOrDeletedBy')}
      </aside>

      <Show when={_form.response.status === 'error'}>
        <p role="alert" class="text-danger">{_form.response.message}</p>
      </Show>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <button disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
          <Send class="size-4" />
          {_form.submitting ? t('question.publishing') : t('newquestion.publishQuestion')}
        </button>
      </div>
    </Form>
  );
}

export default withLocale(NewQuestion);
