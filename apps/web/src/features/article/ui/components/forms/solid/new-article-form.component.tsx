import { createForm, getValue, setValue } from '@modular-forms/solid';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import MarkdownEditor from '@/shared/ui/editor/MarkdownEditorLoader';
import { renderContentToHtml } from '@/shared/ui/editor/content';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { withLocale } from '@/shared/i18n/core/solid';
import { countWords, estimateReadingMinutes } from '@/shared/utils/content-metrics.util.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canSaveArticleDraft } from '@/features/article/access/article.access.ts';
import { saveArticleDraft } from '@/features/article/actions/article.action.ts';
import { createSignal, Show } from 'solid-js';
import { Image, Save, X } from 'lucide-solid';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useI18n } from '@/features/article/i18n';
import { createArticleFormSchema, type ArticleFormInput } from '@/features/article/ui/schemas/forms.schema.ts';
function NewArticleForm() {
  const { t, locale } = useI18n();
  const schema = createArticleFormSchema(locale());
  const [coverFile, setCoverFile] = createSignal<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = createSignal('');
  const [preview, setPreview] = createSignal(false);
  let coverInput: HTMLInputElement | undefined;

  const [_form, { Form, Field: FormField }] = createForm<ArticleFormInput>({
    initialValues: { title: '', description: '', content: '', tags: [] },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const title = () => getValue(_form, 'title') ?? '';
  const description = () => getValue(_form, 'description') ?? '';
  const content = () => getValue(_form, 'content') ?? '';

  const save = async (values: ArticleFormInput) => {
    const article = await saveArticleDraft({
      title: values.title.trim(),
      description: values.description.trim(),
      content: values.content.trim(),
      tagSlugs: values.tags,
      coverFile: coverFile() ?? undefined,
    });

    if (article) redirectTo(`/articles/${encodeURIComponent(article.id)}/edit`);
  };

  const selectCover = (event: Event & { currentTarget: HTMLInputElement }) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreviewUrl('');
    if (coverInput) coverInput.value = '';
  };

  return (
    <Form
      onSubmit={save}
      aria-labelledby="article-editor-heading"
      class="space-y-5 pb-8"
      aria-busy={_form.submitting}
    >
      <header class="border-b border-line pb-5">
        <p class="text-accent-label">{t('articleform.newArticle')}</p>
        <h1 id="article-editor-heading" class="heading-form-page mt-2 max-w-4xl">
          {t('articleform.writeContentTechnicalPublishWhenIsReady')}
        </h1>
      </header>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
        <div class="min-w-0 space-y-5">
          <div class="grid items-start gap-5 rounded-2xl border border-line bg-surface-elevated p-5 sm:p-6">
            <div>
              <p class="text-field-heading">{t('articleform.cover')}</p>
              <input
                ref={(element) => (coverInput = element)}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="sr-only"
                onChange={selectCover}
              />

              <Show
                when={coverPreviewUrl()}
                fallback={
                  <div class="mt-3 flex h-52 items-center justify-center rounded-xl border border-dashed border-line bg-surface">
                    <button type="button" onClick={() => coverInput?.click()} class="action action-secondary action-compact">
                      <Image class="size-4" aria-hidden="true" />
                      {t('articleform.selectMedia')}
                    </button>
                  </div>
                }
              >
                <div class="relative mt-3 h-52 overflow-hidden rounded-xl">
                  <img src={coverPreviewUrl()} alt={t('articleform.coverArticle')} class="size-full object-cover" />
                  <button type="button" onClick={removeCover} class="action action-secondary absolute right-3 bottom-3">
                    <X class="size-4" aria-hidden="true" />
                    {t('articleform.remove')}
                  </button>
                </div>
              </Show>
            </div>

            <Field>
              <label for="article-title" class="field-label">{t('articleform.title')}</label>
              <FormField name="title">
                {(field, inputProps) => (
                  <>
                    <input
                      {...inputProps}
                      id="article-title"
                      required
                      aria-invalid={Boolean(field.error)}
                      placeholder={t('articleform.titleClearArticle')}
                     class="field-control"/>
                    <Show when={field.error}>
                      {(message) => <span role="alert" class="field-error">{message()}</span>}
                    </Show>
                  </>
                )}
              </FormField>
            </Field>

            <Field>
              <label for="article-description" class="field-label">{t('articleform.description')}</label>
              <FormField name="description">
                {(field, inputProps) => (
                  <>
                    <textarea
                      {...inputProps}
                      id="article-description"
                      required
                      maxlength={280}
                      rows={3}
                      aria-invalid={Boolean(field.error)}
                      placeholder={t('articleform.descriptionPlaceholder')}
                     class="field-control resize-y"/>
                    <span class="block text-right text-xs text-content-muted">{description().length}/280</span>
                    <Show when={field.error}>
                      {(message) => <span role="alert" class="field-error">{message()}</span>}
                    </Show>
                  </>
                )}
              </FormField>
            </Field>

            <FormField name="tags" type="string[]">
              {(field) => (
                <>
                  <TagSelector
                    id="article-tags"
                    value={field.value ?? []}
                    onChange={(value) => setValue(_form, 'tags', value)}
                    max={5}
                    label={t('articleform.tags')}
                    placeholder={t('articleform.searchTagsExisting')}
                  />
                  <Show when={field.error}>
                    {(message) => <span role="alert" class="field-error">{message()}</span>}
                  </Show>
                </>
              )}
            </FormField>
          </div>

          <section class="overflow-hidden rounded-2xl border border-line bg-surface-elevated">
            <div class="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pt-4 sm:px-6">
              <div class="flex items-end gap-4" role="tablist" aria-label={t('articleform.content')}>
                <button type="button" role="tab" aria-selected={!preview()} onClick={() => setPreview(false)} class="action action-ghost">
                  {t('articleform.content')}
                </button>
                <button type="button" role="tab" aria-selected={preview()} onClick={() => setPreview(true)} class="action action-ghost">
                  {t('articleform.preview')}
                </button>
              </div>
              <div class="text-xs text-content-muted">
                {countWords(content())} {t('articleform.wordsAlternative2')} {estimateReadingMinutes(content())}{' '}
                {t('articledetail.minReading')}
              </div>
            </div>

            <Show
              when={!preview()}
              fallback={
                <div
                  class="content-prose min-h-[440px] p-5 sm:p-6"
                  innerHTML={renderContentToHtml(content()) || `<p>${t('articleform.withoutContent')}</p>`}
                />
              }
            >
              <div class="p-3 sm:p-4">
                <FormField name="content">
                  {(field) => (
                    <>
                      <MarkdownEditor
                        value={field.value ?? ''}
                        onChange={(value) => setValue(_form, 'content', value)}
                        placeholder={t('articleform.startWriteMarkdown')}
                        minHeight={440}
                        ariaLabel={t('articleform.contentArticleMarkdown')}
                      />
                      <Show when={field.error}>
                        {(message) => <span role="alert" class="field-error">{message()}</span>}
                      </Show>
                    </>
                  )}
                </FormField>
              </div>
            </Show>
          </section>

          <Show when={_form.response.status === 'error'}>
            <p role="alert" class="text-danger">{_form.response.message}</p>
          </Show>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-5">
          <section class="rounded-2xl border border-line bg-surface-elevated p-4">
            <h2 class="heading-tiny text-xs">
              {t('articleform.status')}
            </h2>
            <div class="mt-4 flex items-center gap-2 text-sm font-semibold text-content">
              <span class="size-2 rounded-full bg-warning" />
              {t('articleform.draft')}
            </div>
            <div class="mt-5">
              <button
                type="submit"
               
                disabled={
                  !isClientAccessAllowed(canSaveArticleDraft) ||
                  _form.submitting ||
                  !title().trim() ||
                  !description().trim() ||
                  !content().trim()
                } aria-busy={_form.submitting} class="action action-primary"
               
              >
                <Save class="size-4" />
                {t('articleform.saveDraft')}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </Form>
  );
}

export default withLocale(NewArticleForm);
