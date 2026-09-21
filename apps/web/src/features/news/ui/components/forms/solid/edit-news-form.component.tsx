import { Eye, Save, GitBranch, X } from 'lucide-solid';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { createForm, getValue, setValue, setValues, submit } from '@modular-forms/solid';
import { formatLocalizedDate } from '@/shared/i18n/core';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import MarkdownEditor from '@/shared/ui/editor/MarkdownEditorLoader';
import NewsPreviewDialog from './news-preview-dialog.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/news/i18n';
import { useEditNews } from '@/features/news/ui/hooks/use-edit-news.hook.ts';
import { setNewsCommentsEnabled } from '@/features/news/actions/news.action.ts';
import NewsEditorStatusPanel from '../edit/news-editor-status-panel.component.tsx';
import NewsEditorManagementPanel from '../edit/news-editor-management-panel.component.tsx';
import VersionConflictNotice from '@/shared/ui/editor/components/version-conflict-notice.component.tsx';
import NewsDeleteConfirmation from '../edit/news-delete-confirmation.component.tsx';
import { createNewsFormSchema, type NewsFormInput } from '@/features/news/ui/schemas/forms.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';

function EditNewsForm(props: { id: string }) {
  const { t, locale } = useI18n();
  const editor = useEditNews(() => props.id);
  const schema = createNewsFormSchema(locale());
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
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  let formInitialized = false;
  createEffect(() => {
    if (formInitialized || editor.loading()) return;
    formInitialized = true;
    setValues(_form, editor.formDefaults(), { shouldTouched: false, shouldDirty: false, shouldValidate: false });
  });
  const title = () => getValue(_form, 'title') ?? '';
  const description = () => getValue(_form, 'description') ?? '';
  const content = () => getValue(_form, 'content') ?? '';
  const words = createMemo(() => (content().trim() ? content().trim().split(/\s+/).length : 0));
  const [preview, setPreview] = createSignal(false);
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  const updatedAt = () =>
    editor.updatedAt()
      ? formatLocalizedDate(editor.updatedAt()!, locale(), {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;
  let coverInput: HTMLInputElement | undefined;

  const confirmDeletion = async () => {
    setConfirmDelete(false);
    await editor.deleteNews();
  };

  return (
    <Form
      onSubmit={(values) => editor.save(values)}
      class="space-y-5 pb-8"
      aria-busy={editor.loading() || editor.saving()}
    >
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p class="text-accent-label">{t('newsform.editNews')}</p>
          <h1 class="heading-form-page mt-2 max-w-4xl">
            {title() || t('newsform.loadingNews')}
          </h1>
          <Show when={updatedAt()}>
            {(value) => (
              <p class="text-muted mt-1">
                {t('newsdetail.updatedAt')} {value()}
              </p>
            )}
          </Show>
        </div>
        <div class="flex gap-2">
          <Show when={editor.slug()}>
            <a href={`/news/${encodeURIComponent(editor.slug())}`} class="action action-secondary">
              {t('newsform.viewNews')}
            </a>
          </Show>
          <button type="submit" disabled={!editor.canSaveNow()} class="action action-primary">
            <Save class="size-4" aria-hidden="true" />
            {t('newsform.save')}
          </button>
        </div>
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
                disabled={!editor.canEdit()}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) return;
                  editor.selectCover(file);
                  setValue(_form, 'coverImageUrl', editor.coverUrl());
                }}
              />
              <div class="relative mt-2 flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-surface">
                <Show when={editor.coverUrl()} fallback={<span class="text-center text-sm text-content-muted">{t('newsform.withoutCover')}</span>}>
                  <img src={editor.coverUrl()} alt={t('newsform.coverNews')} class="h-52 w-full object-cover" />
                </Show>
                <div class="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-scrim p-3">
                  <button type="button" disabled={!editor.canEdit()} onClick={() => coverInput?.click()} class="action action-secondary action-compact">
                    {editor.coverUrl() ? t('news.replace') : t('newsform.selectMedia')}
                  </button>
                  <Show when={editor.coverUrl()}>
                    <button type="button" onClick={() => { editor.removeCover(); setValue(_form, 'coverImageUrl', ''); }} disabled={!editor.canEdit()} class="action action-secondary">
                      <X class="size-4" />
                      {t('newsform.remove')}
                    </button>
                  </Show>
                </div>
              </div>
            </div>

            <div class="min-w-0 space-y-5">
              <Field>
                <label for="edit-news-title" class="field-label">{t('newsform.title')}</label>
                <FormField name="title">
                  {(field, props) => (
                    <>
                      <input {...props} id="edit-news-title" placeholder={t('newsform.titleClearNews')} disabled={!editor.canEdit()}  class="field-control"/>
                      <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                    </>
                  )}
                </FormField>
              </Field>
              <Field>
                <label for="edit-news-description" class="field-label">{t('newsform.description')}</label>
                <FormField name="description">
                  {(field, props) => (
                    <>
                      <textarea {...props} id="edit-news-description" maxLength={280} rows={3} placeholder={t('newsform.descriptionPlaceholder')} disabled={!editor.canEdit()}  class="field-control resize-y"/>
                      <span class="block text-right text-xs text-content-muted">{description().length}/280</span>
                      <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                    </>
                  )}
                </FormField>
              </Field>
              <Field>
                <label for="edit-news-occurred-at" class="field-label">{t('newsform.happened')}</label>
                <FormField name="occurredAt">
                  {(field, props) => (
                    <input
                      {...props}
                      id="edit-news-occurred-at"
                      type="datetime-local"
                      value={field.value ? field.value.slice(0, 16) : ''}
                      disabled={!editor.canEdit()}
                      onInput={(event) => setValue(_form, 'occurredAt', event.currentTarget.value ? new Date(event.currentTarget.value).toISOString() : null)}
                     class="field-control"/>
                  )}
                </FormField>
              </Field>
              <FormField name="tags" type="string[]">
                {(field) => (
                  <>
                    <TagSelector
                      id="edit-news-tags"
                      value={field.value ?? []}
                      onChange={(value) => setValue(_form, 'tags', value)}
                      label={t('newsform.tags')}
                      placeholder={t('newsform.searchTagsExisting')}
                      disabled={!editor.canEdit()}
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
                      readOnly={!editor.canEdit()}
                    />
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </div>
          </section>
          <Show when={editor.error()}>
            {(value) => (
              <p role="alert" class="text-danger rounded-xl border border-danger-border bg-danger-bg p-3">
                {value()}
              </p>
            )}
          </Show>
          <Show when={editor.message()}>
            {(value) => (
              <p role="status" class="text-body rounded-xl border border-action-border bg-action-subtle p-3">
                {value()}
              </p>
            )}
          </Show>
          <Show when={editor.conflict()}>
            {(conflict) => (
              <VersionConflictNotice
                message={t('newsform.existsVersionMoreNewServer')}
                content={conflict().content}
                actions={
                  <button type="button" onClick={editor.adoptConflict} class="action action-secondary">
                    <GitBranch class="size-4" aria-hidden="true" />
                    {t('newsform.adoptVersionServer')}
                  </button>
                }
              />
            )}
          </Show>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-5">
          <NewsEditorStatusPanel
            status={editor.status()}
            publishedAt={editor.publishedAt()}
            updatedAt={editor.updatedAt()}
            version={editor.version()}
            canPublish={editor.canPublish()}
            saveAvailable={editor.canSaveNow()}
            publishAvailable={editor.canPublishNow()}
            onSave={() => submit(_form)}
            onPublish={() => void editor.publish()}
          />

          <section class="rounded-2xl border border-line bg-surface-elevated p-4">
            <h2 class="heading-tiny text-xs">
              {t('newsform.activity')}
            </h2>
            <dl class="mt-5 space-y-4 text-sm">
              <div class="flex justify-between">
                <dt class="text-content-muted">{t('newsform.views')}</dt>
                <dd>{editor.views()}</dd>
              </div>
            </dl>
          </section>

          <NewsEditorManagementPanel
            canArchive={editor.canArchive()}
            canUnarchive={editor.canUnarchive()}
            canDelete={editor.canDelete()}
            archiveAvailable={editor.canArchiveNow()}
            unarchiveAvailable={editor.canUnarchiveNow()}
            deleteAvailable={editor.canDeleteNow()}
            onArchive={() => void editor.archive()}
            onUnarchive={() => void editor.unarchive()}
            onDeleteRequest={() => setConfirmDelete(true)}
            onEnableComments={() => void setNewsCommentsEnabled(props.id, true)}
            onDisableComments={() => void setNewsCommentsEnabled(props.id, false)}
          />
        </aside>
      </div>

      <Show when={preview()}>
        <NewsPreviewDialog title={title()} content={content()} onClose={() => setPreview(false)} />
      </Show>
      <NewsDeleteConfirmation
        open={confirmDelete()}
        deleteAvailable={editor.canDeleteNow()}
        onConfirm={() => void confirmDeletion()}
        onCancel={() => setConfirmDelete(false)}
      />
    </Form>
  );
}

export default withLocale(EditNewsForm);
