import { createEffect, Show, createSignal } from 'solid-js';
import { createForm, setValue, setValues } from '@modular-forms/solid';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/job/i18n';
import { jobTypeOptions, workplaceOptions, compensationUnitOptions, type CompensationUnit } from '../options/job-options';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ErrorState from '@/shared/ui/components/feedback/error-state.component.tsx';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import { useEditJob } from '@/features/job/ui/hooks/use-edit-job.hook.ts';
import { Eye, Save } from 'lucide-solid';
import JobLifecyclePanel from './edit/job-lifecycle-panel.component.tsx';
import JobPreviewDialog from './edit/job-preview-dialog.component.tsx';
import { createJobFormSchema, type JobFormInput } from '@/features/job/ui/schemas/forms.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';

function EditJob(props: { id: string }) {
  const { t, locale } = useI18n();
  const edit = useEditJob(props.id);
  const schema = createJobFormSchema(locale());
  const [_form, { Form, Field: FormField }] = createForm<JobFormInput>({
    initialValues: {
      title: '',
      description: '',
      employmentType: 'full_time',
      workplaceType: 'remote',
      location: null,
      compensationMin: '',
      compensationMax: '',
      compensationCurrency: '',
      compensationUnit: 'yearly',
      applicationUrl: '',
      tagSlugs: [],
    },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  let formInitialized = false;
  createEffect(() => {
    const item = edit.job();
    if (formInitialized || !item) return;
    formInitialized = true;
    setValues(
      _form,
      {
        title: item.title,
        description: item.description,
        employmentType: item.employmentType,
        workplaceType: item.workplaceType,
        location: item.location,
        compensationMin: item.compensationMin,
        compensationMax: item.compensationMax,
        compensationCurrency: item.compensationCurrency ?? '',
        compensationUnit: item.compensationUnit ?? 'yearly',
        applicationUrl: item.applicationUrl,
        tagSlugs: item.tagSlugs,
      },
      { shouldTouched: false, shouldDirty: false, shouldValidate: false },
    );
  });
  const [previewOpen, setPreviewOpen] = createSignal(false);

  return (
    <Show when={!edit.loading()} fallback={<LoadingState aria-live="polite">{t('editjob.loadingJob')}</LoadingState>}>
      <Show
        when={edit.job()}
        fallback={
          <ErrorState role="alert" aria-live="polite">
            {t('editjob.jobnotFound')}
          </ErrorState>
        }
      >
        {(item) => (
          <Form
            onSubmit={(values) => edit.save(values)}
            class="space-y-8 rounded-3xl border border-line bg-surface-elevated p-6"
          >
            <fieldset class="space-y-4">
              <legend class="mb-4 text-sm font-semibold text-content">{t('editjob.opportunity')}</legend>
              <Field>
                <label for="edit-job-title" class="field-label">{t('editjob.title')}</label>
                <FormField name="title">{(field, props) => <><input {...props} id="edit-job-title" maxlength={180} placeholder={t('newjob.exDeveloperBackendTypescript')}  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
              </Field>
              <div class="grid gap-4 sm:grid-cols-2">
                <FormField name="employmentType">{(field) => <><Select id="edit-job-type" label={t('editjob.typeHiring')} value={field.value ?? 'full_time'} options={jobTypeOptions(t)} onChange={(value) => setValue(_form, 'employmentType', value)} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
                <FormField name="workplaceType">{(field) => <><Select id="edit-job-workplace" label={t('editjob.model')} value={field.value ?? 'remote'} options={workplaceOptions(t)} onChange={(value) => setValue(_form, 'workplaceType', value)} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
              </div>
              <Field>
                <label for="edit-job-description" class="field-label">{t('editjob.description')}</label>
                <FormField name="description">{(field, props) => <><textarea {...props} id="edit-job-description" minlength={20} maxlength={20000} rows={8} placeholder={t('newjob.responsibilitiesRequirementsContextConditionsRelevant')}  class="field-control resize-y"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
              </Field>
              <FormField name="tagSlugs" type="string[]">{(field) => <><TagSelector id="edit-job-tags" value={field.value ?? []} onChange={(value) => setValue(_form, 'tagSlugs', value)} max={5} label={t('editjob.tags')} placeholder={t('newjob.typescriptBackend')} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
            </fieldset>

            <fieldset class="space-y-4">
              <legend class="mb-4 text-sm font-semibold text-content">{t('editjob.publisherApplication')}</legend>
              <div class="grid gap-4 sm:grid-cols-2">
                <Field>
                  <label for="job-location" class="field-label">
                    {t('editjob.location')} <span class="normal-case tracking-normal">{t('editjob.optional')}</span>
                  </label>
                  <FormField name="location">{(field, props) => <><input {...props} id="job-location" value={field.value ?? ''} onInput={(event) => setValue(_form, 'location', event.currentTarget.value || null)} placeholder={t('newjob.cityRegionOrCountry')}  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
                </Field>
                <Field>
                  <label for="edit-job-application-url" class="field-label">{t('newjob.urlApplicationOrContact')}</label>
                  <FormField name="applicationUrl">{(field, props) => <><input {...props} id="edit-job-application-url" type="url" placeholder="https://..."  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
                </Field>
              </div>
            </fieldset>

            <fieldset class="space-y-4">
              <legend class="mb-4 text-sm font-semibold text-content">{t('editjob.compensation')}</legend>
              <div class="grid gap-4 sm:grid-cols-3">
                <Field><label for="edit-job-comp-min" class="field-label">{t('editjob.minimum')}</label><FormField name="compensationMin" type="string">{(field, props) => <><input {...props} id="edit-job-comp-min" type="number" min="0.01" step="0.01" placeholder="50000"  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField></Field>
                <Field><label for="edit-job-comp-max" class="field-label">{t('editjob.maximum')} <span class="normal-case tracking-normal">{t('editjob.optional')}</span></label><FormField name="compensationMax" type="string">{(field, props) => <><input {...props} id="edit-job-comp-max" type="number" min="0.01" step="0.01" placeholder="80000"  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField></Field>
                <Field><label for="edit-job-currency" class="field-label">{t('editjob.currency')}</label><FormField name="compensationCurrency">{(field, props) => <><input {...props} id="edit-job-currency" maxlength={3} value={field.value ?? ''} onInput={(event) => setValue(_form, 'compensationCurrency', event.currentTarget.value.toUpperCase())} placeholder={t('newjob.usd')}  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField></Field>
              </div>
              <FormField name="compensationUnit">{(field) => <><Select<CompensationUnit> id="edit-job-compensation-unit" label={t('editjob.unit')} value={field.value ?? 'yearly'} options={compensationUnitOptions(t)} onChange={(value) => setValue(_form, 'compensationUnit', value)} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
            </fieldset>

            <Show when={edit.error()}>
              <p aria-live="polite" role="alert" class="text-danger">
                {edit.error()}
              </p>
            </Show>

            <div class="flex flex-wrap gap-3">
              <button type="button" disabled={edit.busy()} onClick={() => setPreviewOpen(true)} class="action action-secondary">
                <Eye class="size-4" />
                {t('editjob.viewPreview')}
              </button>
              <button disabled={edit.busy()} aria-busy={edit.busy()} class="action action-primary">
                <Save class="size-4" />
                {edit.busy() ? t('editjob.saving') : t('editjob.saveChanges')}
              </button>
              <a href={routes.account.jobs} class="action action-secondary">
                {t('editjob.cancel')}
              </a>
            </div>

            <JobLifecyclePanel
              job={item()}
              busy={edit.busy()}
              canClose={edit.canClose()}
              canRenew={edit.canRenew()}
              canWithdraw={edit.canWithdraw()}
              onAction={(action) => void edit.changeLifecycle(action)}
            />

            <Show when={previewOpen()}>
              <JobPreviewDialog job={item()} onClose={() => setPreviewOpen(false)} />
            </Show>
          </Form>
        )}
      </Show>
    </Show>
  );
}

export default withLocale(EditJob);
