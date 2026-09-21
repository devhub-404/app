import { createEffect, createSignal, Show } from 'solid-js';
import { formatLocalizedDate } from '@/shared/i18n/core';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/article/i18n';
import { useEditArticle } from '@/features/article/ui/hooks/use-edit-article.hook.ts';
import { setArticleCommentsEnabled } from '@/features/article/actions/article.action.ts';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import MarkdownEditor from '@/shared/ui/editor/MarkdownEditorLoader';
import { renderContentToHtml } from '@/shared/ui/editor/content';
import ArticleEditorStatusPanel from '../edit/article-editor-status-panel.component.tsx';
import ArticleMetrics from '../../article-metrics.component.tsx';
import ArticleEditorManagementPanel from '../edit/article-editor-management-panel.component.tsx';
import VersionConflictNotice from '@/shared/ui/editor/components/version-conflict-notice.component.tsx';
import ArticleDeleteDialog from '../edit/article-delete-dialog.component.tsx';
import { createArticleFormSchema, type ArticleFormInput } from '@/features/article/ui/schemas/forms.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';
import { countWords, estimateReadingMinutes } from '@/shared/utils/content-metrics.util.ts';
import { createForm, getValue, setValue, setValues, submit } from '@modular-forms/solid';
function EditArticleForm(props: { id: string }) {
  const { t, locale } = useI18n();
  const editor = useEditArticle(() => props.id);
  const schema = createArticleFormSchema(locale());
  const [_form, { Form, Field: FormField }] = createForm<ArticleFormInput>({
    initialValues: { title: '', description: '', content: '', tags: [] },
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
  const description = () => getValue(_form, 'description') ?? '';
  const content = () => getValue(_form, 'content') ?? '';
  const words = () => countWords(content());
  const readingMinutes = () => estimateReadingMinutes(content());
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  let coverInput: HTMLInputElement | undefined;
  const formattedUpdatedAt = () =>
    editor.updatedAt()
      ? formatLocalizedDate(editor.updatedAt()!, locale(), { day: '2-digit', month: 'short', year: 'numeric' })
      : null;

  const confirmDeletion = async () => {
    setConfirmDelete(false);
    await editor.deleteArticle();
  };

  const updateComments = async (enabled: boolean) => {
    const result = await setArticleCommentsEnabled(props.id, enabled);
    if (result.kind === 'failure') {
      notifyError(result.code);
      return;
    }
    notifySuccess(result.code);
  };

  return (
    <Form
      onSubmit={(values) => editor.save(values)}
      aria-labelledby="article-editor-heading"
      class="space-y-5 pb-8"
      aria-busy={editor.loading() || editor.saving()}
    >
      <header class="border-b border-line pb-5">
        <p class="text-accent-label">{t('articledetail.editArticle')}</p>
        <h1 id="article-editor-heading" class="heading-form-page mt-2 max-w-4xl">
          {editor.formDefaults().title || t('articleform.loadingArticle')}
        </h1>
        <Show when={formattedUpdatedAt()}>
          {(value) => (
            <p class="text-muted mt-1">
              {t('articledetail.updated')} {value()}
            </p>
          )}
        </Show>
      </header>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-6">
        <div class="min-w-0 space-y-5">
          <div class="grid gap-5 rounded-2xl border border-line bg-surface-elevated p-5 sm:p-6">
            <div>
              <p class="text-field-heading">{t('articleform.cover')}</p>
              <input
                ref={(element) => (coverInput = element)}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="sr-only"
                disabled={!editor.canEdit()}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) editor.selectCover(file);
                }}
              />
              <div class="relative mt-3 flex h-52 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-surface sm:h-64">
                <Show
                  when={editor.coverUrl()}
                  fallback={<button type="button" disabled={!editor.canEdit()} onClick={() => coverInput?.click()} class="action action-secondary action-compact">{t('articleform.selectMedia')}</button>}
                >
                  <img src={editor.coverUrl()} alt={t('articleform.coverArticle')} class="size-full object-cover" />
                  <div class="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-scrim p-3">
                    <button type="button" disabled={!editor.canEdit()} onClick={() => coverInput?.click()} class="action action-secondary action-compact">{t('article.replace')}</button>
                    <button type="button" disabled={!editor.canEdit()} onClick={editor.removeCover} class="action action-secondary">{t('articleform.remove')}</button>
                  </div>
                </Show>
              </div>
            </div>
            <Field>
              <label for="edit-article-title" class="field-label">{t('articleform.title')}</label>
              <FormField name="title">
                {(field, inputProps) => (
                  <>
                    <input {...inputProps} id="edit-article-title" placeholder={t('articleform.titleClearArticle')} disabled={!editor.canEdit()}  class="field-control"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
            <Field>
              <label for="edit-article-description" class="field-label">{t('articleform.description')}</label>
              <FormField name="description">
                {(field, inputProps) => (
                  <>
                    <textarea {...inputProps} id="edit-article-description" maxLength={280} rows={3} placeholder={t('articleform.descriptionPlaceholder')} disabled={!editor.canEdit()}  class="field-control resize-y"/>
                    <span class="block text-right text-xs text-content-muted">{description().length}/280</span>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
            <FormField name="tags" type="string[]">
              {(field) => (
                <>
                  <TagSelector id="edit-article-tags" value={field.value ?? []} onChange={(value) => setValue(_form, 'tags', value)} max={5} label={t('articleform.tags')} placeholder={t('articleform.searchTagsExisting')} disabled={!editor.canEdit()} />
                  <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                </>
              )}
            </FormField>
          </div>
          <section class="overflow-hidden rounded-2xl border border-line bg-surface-elevated">
            <div class="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pt-4 sm:px-6">
              <div class="flex items-end gap-4" role="tablist" aria-label={t('articleform.content')}>
                <button type="button" role="tab" aria-selected={!editor.preview()} onClick={() => editor.setPreview(false)} class="action action-ghost">{t('articleform.content')}</button>
                <button type="button" role="tab" aria-selected={editor.preview()} onClick={() => editor.setPreview(true)} class="action action-ghost">{t('articleform.preview')}</button>
              </div>
              <div class="text-xs text-content-muted">{words()} {t('articleform.wordsAlternative2')} {readingMinutes()} {t('articledetail.minReading')}</div>
            </div>
            <Show when={!editor.preview()} fallback={<div class="content-prose min-h-[440px] p-5 sm:p-6" innerHTML={renderContentToHtml(content()) || `<p>${t('articleform.withoutContent')}</p>`} />}>
              <div class="p-3 sm:p-4">
                <FormField name="content">
                  {(field) => (
                    <>
                      <MarkdownEditor value={field.value ?? ''} onChange={(value) => setValue(_form, 'content', value)} placeholder={t('articleform.startWriteMarkdown')} minHeight={440} ariaLabel={t('articleform.contentArticleMarkdown')} readOnly={!editor.canEdit()} />
                      <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                    </>
                  )}
                </FormField>
              </div>
            </Show>
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
        </div>

        <aside class="space-y-4 lg:sticky lg:top-5">
          <ArticleEditorStatusPanel
            status={editor.status()}
            publishedAt={editor.publishedAt()}
            updatedAt={editor.updatedAt()}
            version={editor.version()}
            slug={editor.slug()}
            canPublish={editor.canPublish()}
            publishAvailable={editor.canPublishNow()}
            saveAvailable={editor.canSaveNow()}
            onPublish={(publishedAt) => void editor.publish(publishedAt)}
            onSave={() => submit(_form)}
          />

          <ArticleMetrics
            heading={t('articleform.activity')}
            readingTimeMinutes={readingMinutes()}
            views={editor.views()}
            votes={editor.votes()}
            commentCount={editor.comments()}
          />

          <ArticleEditorManagementPanel
            canArchive={editor.canArchive()}
            canUnarchive={editor.canUnarchive()}
            canDelete={editor.canDelete()}
            archiveAvailable={editor.canArchiveNow()}
            unarchiveAvailable={editor.canUnarchiveNow()}
            deleteAvailable={editor.canDeleteNow()}
            onArchive={() => void editor.archive()}
            onUnarchive={() => void editor.unarchive()}
            onDeleteRequest={() => setConfirmDelete(true)}
            onEnableComments={() => void updateComments(true)}
            onDisableComments={() => void updateComments(false)}
          />
        </aside>
      </div>

      <Show when={editor.conflict()}>
        {(conflict) => (
          <VersionConflictNotice
            message={t('articleform.existsVersionMoreNewServer')}
            content={conflict().content}
            actions={<></>}
          />
        )}
      </Show>
      <ArticleDeleteDialog
        open={confirmDelete()}
        deleteAvailable={editor.canDeleteNow()}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void confirmDeletion()}
      />
    </Form>
  );
}

export default withLocale(EditArticleForm);
