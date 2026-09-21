import MarkdownEditor from '@/shared/ui/editor/MarkdownEditorLoader';
import { createForm, reset, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { useI18n } from '@/features/q-and-a/i18n';
import { createAnswerFormSchema, type AnswerFormInput } from '@/features/q-and-a/ui/schemas/forms.schema.ts';

export default function QuestionAnswerComposer(props: {
  busy: boolean;
  onSubmit: (value: AnswerFormInput) => Promise<void>;
}) {
  const { t, locale } = useI18n();
  const schema = createAnswerFormSchema(locale());
  const [_form, { Form, Field }] = createForm<AnswerFormInput>({
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  return (
    <Form
      onSubmit={async (value) => {
        await props.onSubmit(value);
        reset(_form);
      }}
      class="grid gap-3 rounded-2xl border border-line bg-surface-elevated p-5"
    >
      <div class="grid gap-2">
        <h2 class="heading-tiny text-sm">
          {t('questiondetail.answer')}
        </h2>
        <p class="text-caption">{t('questiondetail.answerWillBePermanentAfterPublication')}</p>
      </div>
      <Field name="content">
        {(field) => (
          <MarkdownEditor
            value={field.value ?? ''}
            onChange={(value) => setValue(_form, 'content', value)}
            placeholder={t('questiondetail.writeAnswer')}
            ariaLabel={t('questiondetail.contentAnswer')}
          />
        )}
      </Field>
      <div class="flex justify-end">
        <button type="submit" disabled={props.busy} aria-busy={props.busy} class="action action-primary">
          {props.busy ? t('questiondetail.publishing') : t('questiondetail.reply')}
        </button>
      </div>
    </Form>
  );
}
