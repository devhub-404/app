import { createEffect, Show, createSignal } from 'solid-js';
import { createForm, setValue, setValues } from '@modular-forms/solid';
import type { Project } from '@/features/project/types/project.type.ts';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/project/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ErrorState from '@/shared/ui/components/feedback/error-state.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import { useEditProject } from '@/features/project/ui/hooks/use-edit-project.hook.ts';
import ProjectLifecyclePanel from './edit/project-lifecycle-panel.component.tsx';
import ProjectPreviewDialog from './edit/project-preview-dialog.component.tsx';
import { createProjectFormSchema, type ProjectFormInput } from '@/features/project/ui/schemas/forms.schema.ts';
import { Eye, Save } from 'lucide-solid';
import { zodForm } from '@/shared/ui/forms/zod-form';

function EditProject(props: { id: string }) {
  const { t, locale } = useI18n();
  const edit = useEditProject(props.id);
  const schema = createProjectFormSchema(locale());
  const [_form, { Form }] = createForm<ProjectFormInput>({
    initialValues: { title: '', summary: '', description: '', projectUrl: null, repositoryUrl: null, tagSlugs: [] },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  let formInitialized = false;
  createEffect(() => {
    const item = edit.project();
    if (formInitialized || !item) return;
    formInitialized = true;
    setValues(
      _form,
      {
        title: item.title,
        summary: item.summary,
        description: item.description,
        projectUrl: item.projectUrl,
        repositoryUrl: item.repositoryUrl,
        tagSlugs: item.tagSlugs,
      },
      { shouldTouched: false, shouldDirty: false, shouldValidate: false },
    );
  });
  const [previewOpen, setPreviewOpen] = createSignal(false);

  return (
    <Show
      when={!edit.loading()}
      fallback={<LoadingState aria-live="polite">{t('editproject.loadingProject')}</LoadingState>}
    >
      <Show
        when={edit.project()}
        fallback={
          <ErrorState role="alert" aria-live="polite">
            {t('editproject.projectnotFoundBetweenProjects')}
          </ErrorState>
        }
      >
        {(item) => (
          <Form
            onSubmit={(values) => edit.save(values)}
            class="space-y-8 rounded-3xl border border-line bg-surface-elevated p-6"
          >
            <fieldset class="space-y-4">
              <legend class="mb-4 text-sm font-semibold text-content">{t('editproject.identityProject')}</legend>
              <Field>
                <label for="project-title" class="field-label">{t('editproject.title')}</label>
                <input
                  id="project-title"
                  required
                  maxlength="180"
                  value={item().title}
                  onInput={(event) => {
                    const value = event.currentTarget.value;
                    edit.update('title', value);
                    setValue(_form, 'title', value);
                  }}
                  placeholder={t('newproject.namePublicProject')}
                 class="field-control"/>
              </Field>
              <Field>
                <label for="project-summary" class="field-label">{t('editproject.summary')}</label>
                <input
                  id="project-summary"
                  required
                  maxlength="280"
                  value={item().summary}
                  onInput={(event) => {
                    const value = event.currentTarget.value;
                    edit.update('summary', value);
                    setValue(_form, 'summary', value);
                  }}
                  placeholder={t('newproject.explainSentenceItResolves')}
                 class="field-control"/>
              </Field>
            </fieldset>

            <fieldset class="space-y-4">
              <legend class="mb-4 text-sm font-semibold text-content">{t('editproject.contextTechnical')}</legend>
              <Field>
                <label for="project-description" class="field-label">{t('editproject.description')}</label>
                <textarea
                  id="project-description"
                  required
                  maxlength="20000"
                  rows={8}
                  value={item().description}
                  onInput={(event) => {
                    const value = event.currentTarget.value;
                    edit.update('description', value);
                    setValue(_form, 'description', value);
                  }}
                  placeholder={t('newproject.problemDecisionsTechnicalArchitectureLimitationsResults')}
                 class="field-control resize-y"/>
              </Field>
              <TagSelector
                id="project-tags"
                value={item().tagSlugs}
                onChange={(value) => {
                  edit.update('tagSlugs', value);
                  setValue(_form, 'tagSlugs', value);
                }}
                max={5}
                label={t('editproject.tags')}
                placeholder={t('newproject.solidjsTypescript')}
              />
            </fieldset>

            <fieldset class="space-y-4">
              <legend class="mb-4 text-sm font-semibold text-content">
                {t('editproject.links')} <span class="font-normal text-content-muted">{t('editproject.optional')}</span>
              </legend>
              <div class="grid gap-4 sm:grid-cols-2">
                <Field>
                  <label for="project-url" class="field-label">{t('editproject.project')}</label>
                  <input
                    id="project-url"
                    type="url"
                    value={item().projectUrl ?? ''}
                    onInput={(event) => {
                      const value = event.currentTarget.value || null;
                      edit.update('projectUrl', value as Project['projectUrl']);
                      setValue(_form, 'projectUrl', value);
                    }}
                    placeholder="https://produto.dev"
                   class="field-control"/>
                </Field>
                <Field>
                  <label for="project-repository-url" class="field-label">{t('editproject.repository')}</label>
                  <input
                    id="project-repository-url"
                    type="url"
                    value={item().repositoryUrl ?? ''}
                    onInput={(event) => {
                      const value = event.currentTarget.value || null;
                      edit.update('repositoryUrl', value as Project['repositoryUrl']);
                      setValue(_form, 'repositoryUrl', value);
                    }}
                    placeholder="https://github.com/..."
                   class="field-control"/>
                </Field>
              </div>
            </fieldset>

            <Show when={edit.error()}>
              <p aria-live="polite" role="alert" class="text-danger">
                {edit.error()}
              </p>
            </Show>
            <div class="flex flex-wrap gap-3">
              <button type="button" disabled={edit.busy()} onClick={() => setPreviewOpen(true)} class="action action-secondary">
                <Eye class="size-4" />
                {t('editproject.viewPreview')}
              </button>
              <button disabled={edit.busy()} aria-busy={edit.busy()} class="action action-primary">
                <Save class="size-4" />
                {edit.busy() ? t('editproject.saving') : t('editproject.saveChanges')}
              </button>
              <a href={routes.account.projects} class="action action-secondary">
                {t('editproject.cancel')}
              </a>
            </div>

            <ProjectLifecyclePanel
              project={item()}
              busy={edit.busy()}
              canPublish={edit.canPublish()}
              canArchive={edit.canArchive()}
              canUnarchive={edit.canUnarchive()}
              canDelete={edit.canDelete()}
              onAction={(action) => void edit.changeLifecycle(action)}
            />

            <Show when={previewOpen()}>
              <ProjectPreviewDialog project={item()} onClose={() => setPreviewOpen(false)} />
            </Show>
          </Form>
        )}
      </Show>
    </Show>
  );
}

export default withLocale(EditProject);
