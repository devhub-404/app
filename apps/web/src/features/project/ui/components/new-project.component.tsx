import { Show } from 'solid-js';
import { createForm, setResponse, setValue } from '@modular-forms/solid';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { createProject, publishProject } from '@/features/project/actions/project.action.ts';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/project/i18n';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import { createProjectFormSchema, type ProjectFormInput } from '@/features/project/ui/schemas/forms.schema.ts';
import { Send } from 'lucide-solid';

function NewProject() {
  const { t, locale } = useI18n();
  const schema = createProjectFormSchema(locale());
  const [_form, { Form, Field: FormField }] = createForm<ProjectFormInput>({
    initialValues: { title: '', summary: '', description: '', projectUrl: '', repositoryUrl: '', tagSlugs: [] },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const submit = async (values: ProjectFormInput) => {
    try {
      const result = await createProject({
        ...values,
        title: values.title.trim(),
        summary: values.summary.trim(),
        description: values.description.trim(),
        projectUrl: values.projectUrl?.trim() || null,
        repositoryUrl: values.repositoryUrl?.trim() || null,
        tagSlugs: values.tagSlugs ?? [],
      });
      const project = result.data?.data;
      if (!project) {
        setResponse(_form, { status: 'error', message: t('newproject.couldNotCreateProject') });
        return;
      }
      const publication = await publishProject(project.id);
      if (publication.error) {
        setResponse(_form, { status: 'error', message: t('newproject.projectCreatedButCouldNotPublishOpenIt') });
        return;
      }
      redirectTo(routes.project(project.slug));
    } catch {
      setResponse(_form, { status: 'error', message: t('newproject.couldNotCreateProject') });
    }
  };

  return (
    <Form onSubmit={submit} class="space-y-8 rounded-3xl border border-line bg-surface-elevated p-6">
      <fieldset class="space-y-4">
        <legend class="text-sm font-semibold text-content">{t('editproject.identityProject')}</legend>
        <Field>
          <label for="project-title" class="field-label">{t('editproject.title')}</label>
          <FormField name="title">
            {(field, props) => (
              <>
                <input
                  {...props}
                  id="project-title"
                  required
                  maxlength={180}
                  placeholder={t('newproject.namePublicProject')}
                 class="field-control"/>
                <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
              </>
            )}
          </FormField>
        </Field>
        <Field>
          <label for="project-summary" class="field-label">{t('editproject.summary')}</label>
          <FormField name="summary">
            {(field, props) => (
              <>
                <input
                  {...props}
                  id="project-summary"
                  required
                  maxlength={280}
                  placeholder={t('newproject.explainSentenceItResolves')}
                 class="field-control"/>
                <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
              </>
            )}
          </FormField>
        </Field>
      </fieldset>
      <fieldset class="space-y-4">
        <legend class="text-sm font-semibold text-content">{t('editproject.contextTechnical')}</legend>
        <Field>
          <label for="project-description" class="field-label">{t('editproject.description')}</label>
          <FormField name="description">
            {(field, props) => (
              <>
                <textarea
                  {...props}
                  id="project-description"
                  required
                  maxlength={20000}
                  rows={8}
                  placeholder={t('newproject.problemDecisionsTechnicalArchitectureLimitationsResults')}
                 class="field-control resize-y"/>
                <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
              </>
            )}
          </FormField>
        </Field>
        <FormField name="tagSlugs" type="string[]">
          {(field) => (
            <>
              <TagSelector
                id="project-tags"
                value={field.value ?? []}
                onChange={(value) => setValue(_form, 'tagSlugs', value)}
                max={5}
                label={t('editproject.tags')}
                placeholder={t('newproject.solidjsTypescript')}
              />
                <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
            </>
          )}
        </FormField>
      </fieldset>
      <fieldset class="space-y-4">
        <legend class="text-sm font-semibold text-content">
          {t('editproject.links')} <span class="font-normal text-content-muted">{t('editproject.optional')}</span>
        </legend>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field>
            <label for="project-url" class="field-label">{t('editproject.project')}</label>
            <FormField name="projectUrl">
              {(field, props) => (
                <>
                  <input {...props} id="project-url" type="url" placeholder="https://produto.dev"  class="field-control"/>
                  <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                </>
              )}
            </FormField>
          </Field>
          <Field>
            <label for="project-repository-url" class="field-label">{t('editproject.repository')}</label>
            <FormField name="repositoryUrl">
              {(field, props) => (
                <>
                  <input {...props} id="project-repository-url" type="url" placeholder="https://github.com/..."  class="field-control"/>
                  <Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show>
                </>
              )}
            </FormField>
          </Field>
        </div>
      </fieldset>
      <Show when={_form.response.status === 'error'}>
        <p role="alert" class="text-danger">{_form.response.message}</p>
      </Show>
      <button disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
        <Send class="size-4" />
        {_form.submitting ? t('project.publishing') : t('newproject.publishProject')}
      </button>
    </Form>
  );
}

export default withLocale(NewProject);
