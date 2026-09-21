import { createForm, getValue, setResponse, setValue } from '@modular-forms/solid';
import { createMemo, createSignal, Show } from 'solid-js';
import { Eye, Save, Send, X } from 'lucide-solid';

import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import MarkdownEditor from '@/shared/ui/editor/MarkdownEditorLoader';
import { publishNews, saveNewsDraft } from '@/features/news/actions/news.action.ts';
import { canPublishNews } from '@/features/news/access/news.access.ts';
import { isNewsPublishable } from '@/features/news/domain/news.domain.ts';
import { useAccount } from '@/features/account/public';
import { useI18n } from '@/features/news/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
import { createNewsFormSchema, type NewsFormInput } from '@/features/news/ui/schemas/forms.schema.ts';
import { uploadImage } from '@/shared/media/media.service';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';
import NewsPreviewDialog from './news-preview-dialog.component.tsx';

function NewNewsForm() {
  const { t, locale } = useI18n();
  const { state: account } = useAccount();
  const [coverFile, setCoverFile] = createSignal<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = createSignal('');
  const [preview, setPreview] = createSignal(false);
  const [publishRequested, setPublishRequested] = createSignal(false);
  let coverInput: HTMLInputElement | undefined;

  const [_form, { Form, Field: FormField }] = createForm<NewsFormInput>({
    initialValues: {
      title: '',
      description: '',
      content: '',
      occurredAt: null,
      sourceUrl: '',
      coverImageUrl: '',
      tags: [],
    },
    validate: zodForm(createNewsFormSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });

  const content = () => getValue(_form, 'content') ?? '';
  const words = createMemo(() => (content().trim() ? content().trim().split(/\s+/).length : 0));
  const actor = () => ({
    accountId: account().details?.account.id ?? null,
    role: account().details?.role ?? null,
    organizationIds: [],
    ownerOrganizationIds: [],
  });

  const selectCover = (event: Event & { currentTarget: HTMLInputElement }) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(previewUrl);
    setValue(_form, 'coverImageUrl', previewUrl);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreviewUrl('');
    setValue(_form, 'coverImageUrl', '');
    if (coverInput) coverInput.value = '';
  };

  const submit = async (values: NewsFormInput, publishAfterSave: boolean) => {
    const cover = coverFile();
    let coverMediaId: string | undefined;
    if (cover) {
      const uploaded = await uploadImage(cover, 'content');
      if (uploaded.error || !uploaded.data?.data?.mediaId) {
        setResponse(_form, { status: 'error', message: t('newsform.couldNotSendCover') });
        return;
      }
      coverMediaId = uploaded.data.data.mediaId;
    }

    const result = await saveNewsDraft({
      title: values.title.trim(),
      description: values.description.trim(),
      occurredAt: values.occurredAt,
      tagSlugs: values.tags ?? [],
      ...(values.sourceUrl.trim() ? { sourceUrls: [values.sourceUrl.trim()] } : {}),
      ...(coverMediaId ? { coverMediaId } : {}),
      content: values.content.trim(),
    });
    if (!result.ok || !result.item) {
      setResponse(_form, { status: 'error', message: t('newsform.reviewFieldsRequired') });
      return;
    }

    if (publishAfterSave) {
      const publication = await publishNews(result.item.id);
      if (publication.kind === 'failure') {
        setResponse(_form, { status: 'error', message: t('newsform.reviewFieldsRequired') });
        return;
      }
    }
    redirectTo(`/news/${encodeURIComponent(result.item.id)}/edit`);
  };

  const save = (values: NewsFormInput) => {
    setPublishRequested(false);
    return submit(values, false);
  };

  const publish = (values: NewsFormInput) => {
    setPublishRequested(false);
    return submit(values, true);
  };

  return (
    <Form
      onSubmit={(values) => (publishRequested() ? publish(values) : save(values))}
      class="space-y-5 pb-8"
      aria-busy={_form.submitting}
    >
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p class="text-accent-label">{t('newsform.newNews')}</p>
          <h1 class="heading-form-page mt-2 max-w-4xl">
            {t('newsform.createNewPublicationEditorialDevhub')}
          </h1>
        </div>
        <button type="submit" disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
          <Save class="size-4" />
          {t('newsform.saveDraft')}
        </button>
      </header>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
        <div class="min-w-0 space-y-5">
          <div class="grid gap-5 rounded-2xl border border-line bg-surface-elevated p-5 sm:p-6 lg:grid-cols-[minmax(15rem,32%)_minmax(0,1fr)]">
            <div>
              <p class="text-field-heading">{t('newsform.cover')}</p>
              <input
                ref={(element) => (coverInput = element)}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="sr-only"
                onChange={selectCover}
              />
              <div class="relative mt-2 flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-surface">
                <Show when={coverPreviewUrl()} fallback={<span class="text-center text-sm text-content-muted">{t('newsform.withoutCover')}</span>}>
                  <img src={coverPreviewUrl()} alt={t('newsform.coverNews')} class="h-52 w-full object-cover" />
                </Show>
                <div class="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-scrim p-3">
                  <button type="button" onClick={() => coverInput?.click()} class="action action-secondary action-compact">
                    {coverPreviewUrl() ? t('news.replace') : t('newsform.selectMedia')}
                  </button>
                  <Show when={coverPreviewUrl()}>
                    <button type="button" onClick={removeCover} class="action action-secondary">
                      <X class="size-4" />
                      {t('newsform.remove')}
                    </button>
                  </Show>
                </div>
              </div>
            </div>

            <div class="min-w-0 space-y-5">
              <Field>
                <label for="news-title" class="field-label">{t('newsform.title')}</label>
                <FormField name="title">
                  {(field, props) => (
                    <>
                      <input {...props} id="news-title" placeholder={t('newsform.titleClearNews')}  class="field-control"/>
                      <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                    </>
                  )}
                </FormField>
              </Field>
              <Field>
                <label for="news-description" class="field-label">{t('newsform.description')}</label>
                <FormField name="description">
                  {(field, props) => (
                    <>
                      <textarea {...props} id="news-description" maxLength={280} rows={3} placeholder={t('newsform.descriptionPlaceholder')}  class="field-control resize-y"/>
                      <span class="block text-right text-xs text-content-muted">{(getValue(_form, 'description') ?? '').length}/280</span>
                      <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                    </>
                  )}
                </FormField>
              </Field>
              <Field>
                <label for="news-occurred-at" class="field-label">{t('newsform.happened')}</label>
                <FormField name="occurredAt">
                  {(field, props) => (
                    <input
                      {...props}
                      id="news-occurred-at"
                      type="datetime-local"
                      value={field.value ? field.value.slice(0, 16) : ''}
                      onInput={(event) => setValue(_form, 'occurredAt', event.currentTarget.value ? new Date(event.currentTarget.value).toISOString() : null)}
                     class="field-control"/>
                  )}
                </FormField>
              </Field>
              <Field>
                <label for="news-source" class="field-label">{t('newsform.source')}</label>
                <FormField name="sourceUrl">
                  {(field, props) => (
                    <>
                      <input {...props} id="news-source" type="url" placeholder="https://exemplo.com/noticia"  class="field-control"/>
                      <span class="text-xs text-content-muted">{t('newsform.requiredPublish')}</span>
                      <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                    </>
                  )}
                </FormField>
              </Field>
              <FormField name="tags" type="string[]">
                {(field) => (
                  <>
                    <TagSelector
                      id="news-tags"
                      value={field.value ?? []}
                      onChange={(value) => setValue(_form, 'tags', value)}
                      label={t('newsform.tags')}
                      placeholder={t('newsform.searchTagsExisting')}
                    />
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </div>
          </div>

          <section class="overflow-hidden rounded-2xl border border-line bg-surface-elevated">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div class="flex items-center gap-4">
                <h2 class="heading-tiny text-xs">{t('newsdetail.content')}</h2>
                <button type="button" onClick={() => setPreview(true)} class="action action-ghost">
                  <Eye class="size-4" />
                  {t('newsform.preview')}
                </button>
              </div>
              <div class="text-xs text-content-muted">{words()} {t('newsform.words')}</div>
            </div>
            <div class="p-3 sm:p-4">
              <FormField name="content">
                {(field) => (
                  <>
                    <MarkdownEditor
                      value={field.value ?? ''}
                      onChange={(value) => setValue(_form, 'content', value)}
                      placeholder={t('newsform.startWriteMarkdown')}
                      minHeight={440}
                      ariaLabel={t('newsform.contentNewsMarkdown')}
                    />
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </div>
          </section>

          <Show when={_form.response.status === 'error'}>
            <p role="alert" class="text-danger">{_form.response.message}</p>
          </Show>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-5">
          <section class="rounded-2xl border border-line bg-surface-elevated p-4">
            <h2 class="heading-tiny text-xs">{t('newsform.status')}</h2>
            <div class="mt-4 flex items-center gap-2 text-sm font-semibold text-content">
              <span class="size-2 rounded-full bg-warning" /> {t('newsform.draft')}
            </div>
            <p class="text-muted mt-3">{t('newsform.stillNotPublished')}</p>
            <div class="mt-5 flex flex-col gap-2">
              <button type="submit" disabled={_form.submitting} aria-busy={_form.submitting} class="action action-secondary">
                <Save class="size-4" />
                {t('newsform.saveDraft')}
              </button>
              <Show when={canPublishNews(actor()) && isNewsPublishable({ status: 'draft' })}>
                <button
                 
                  type="submit"
                  disabled={_form.submitting}
                 
                  onClick={() => setPublishRequested(true)} aria-busy={_form.submitting} class="action action-primary"
                >
                  <Send class="size-4" />
                  {t('newsform.publishNews')}
                </button>
              </Show>
            </div>
          </section>
        </aside>
      </div>

      <Show when={preview()}>
        <NewsPreviewDialog
          title={getValue(_form, 'title') ?? ''}
          content={content()}
          onClose={() => setPreview(false)}
        />
      </Show>
    </Form>
  );
}

export default withLocale(NewNewsForm);
