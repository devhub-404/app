import { Show } from 'solid-js';
import { createEffect } from 'solid-js';
import { createForm, getValue, setValue, setValues, submit as submitForm } from '@modular-forms/solid';
import { ExternalLink } from 'lucide-solid';
import DestructiveConfirmation from '@/shared/ui/components/feedback/destructive-confirmation.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ResourceEditorStatusPanel from './edit/resource-editor-status-panel.component.tsx';
import ResourceActivityPanel from './edit/resource-activity-panel.component.tsx';
import ResourceEditorManagementPanel from './edit/resource-editor-management-panel.component.tsx';
import { useEditResource } from '../../hooks/use-edit-resource.hook.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/resource/i18n';
import { createResourceSchema } from '@/features/resource/ui/schemas/forms.schema.ts';
import type { ResourceSubmitData } from '@/features/resource/ui/types/resource-submit.type.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';

function EditResourceForm(props: { id: string }) {
  const { t, locale } = useI18n();
  const editor = useEditResource(() => props.id);
  const [_form, { Form, Field: FormField }] = createForm<ResourceSubmitData>({
    initialValues: { title: '', description: '', url: '', tags: [] },
    validate: zodForm(createResourceSchema(locale())),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  let formInitialized = false;
  createEffect(() => {
    const resource = editor.existing();
    if (formInitialized || !resource) return;
    formInitialized = true;
    setValues(_form, editor.formDefaults(), {
      shouldTouched: false,
      shouldDirty: false,
      shouldValidate: false,
    });
  });
  const title = () => getValue(_form, 'title') ?? '';
  const url = () => getValue(_form, 'url') ?? '';

  return (
    <Form onSubmit={(values) => editor.save(values)} class="space-y-5" aria-busy={editor.loading() || editor.busy()}>
      <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p class="text-accent-label">{t('resourceform.editResource')}</p>
          <h1 class="heading-form-page mt-2">
            {title() || t('resourceform.loadingResource')}
          </h1>
        </div>
        <Show when={url()}>
          <a href={url()} target="_blank" rel="noreferrer" class="action action-secondary">
            {t('resourceform.viewResource')} <ExternalLink class="size-4" />
          </a>
        </Show>
      </header>

      <div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="min-w-0 rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm sm:p-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <label for="resource-title" class="field-label">{t('resourceform.title')}</label>
              <FormField name="title">
                {(field, inputProps) => (
                  <>
                    <input {...inputProps} id="resource-title" disabled={editor.loading() || editor.busy()}  class="field-control"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
            <Field>
              <label for="resource-url" class="field-label">{t('resourceform.url')}</label>
              <FormField name="url">
                {(field, inputProps) => (
                  <>
                    <input
                      {...inputProps}
                      id="resource-url"
                      type="url"
                      disabled={editor.loading() || editor.busy()}
                     class="field-control"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
          </div>
          <div class="mt-4">
            <Field>
              <label for="resource-description" class="field-label">{t('resourceform.description')}</label>
              <FormField name="description">
                {(field, inputProps) => (
                  <>
                    <textarea
                      {...inputProps}
                      id="resource-description"
                      rows={5}
                      disabled={editor.loading() || editor.busy()}
                     class="field-control resize-y"/>
                    <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                  </>
                )}
              </FormField>
            </Field>
          </div>
          <div class="mt-4">
            <FormField name="tags" type="string[]">
              {(field) => (
                <>
                  <TagSelector
                    id="resource-tags"
                    value={field.value ?? []}
                    onChange={(value) => setValue(_form, 'tags', value)}
                    label={t('resourceform.tags')}
                    disabled={editor.loading() || editor.busy()}
                  />
                  <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                </>
              )}
            </FormField>
          </div>
          <Show when={editor.error()}>
            {(message) => (
              <div class="mt-4">
                <p role="alert" class="text-danger">{message()}</p>
              </div>
            )}
          </Show>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-6">
          <ResourceEditorStatusPanel
            status={editor.existing()?.status}
            busy={editor.busy()}
            canSave={editor.canSaveNow()}
            onSave={() => void submitForm(_form)}
          />

          <Show when={editor.existing()}>
            {(resource) => (
              <>
                <ResourceActivityPanel votes={resource().votes} />
                <ResourceEditorManagementPanel
                  busy={editor.busy()}
                  canArchive={editor.canArchive()}
                  canArchiveNow={editor.canArchiveNow()}
                  canUnarchive={editor.canUnarchive()}
                  canUnarchiveNow={editor.canUnarchiveNow()}
                  canDelete={editor.canDelete()}
                  onArchive={() => void editor.archive()}
                  onUnarchive={() => void editor.unarchive()}
                  onRequestDelete={() => editor.setConfirmDelete(true)}
                />
              </>
            )}
          </Show>
        </aside>
      </div>

      <Show when={editor.confirmDelete()}>
        <DestructiveConfirmation
          accessibleLabel={t('resourceform.confirmDeletion')}
          title={t('resourceform.deleteThisResourcePermanently')}
          description={t('resourceform.deletionRequiresConfirmation')}
          confirmLabel={t('resourceform.confirmDeletion')}
          cancelLabel={t('resourceform.cancel')}
          busy={!editor.canDeleteNow() || editor.busy()}
          onConfirm={() => void editor.remove()}
          onCancel={() => editor.setConfirmDelete(false)}
        />
      </Show>
    </Form>
  );
}

export default withLocale(EditResourceForm);
