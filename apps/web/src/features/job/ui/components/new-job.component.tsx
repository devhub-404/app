import { createSignal, onMount, Show } from 'solid-js';
import { createForm, getValue, setResponse, setValue } from '@modular-forms/solid';
import { createJob, submitJob } from '@/features/job/actions/job.action.ts';
import { listMyOrganizations, type MyOrganization } from '@/features/organization/public';
import { routes } from '@/shared/navigation/routes';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/job/i18n';
import Field from '@/shared/ui/components/forms/field.component.tsx';
import Select from '@/shared/ui/components/forms/select.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import { Send } from 'lucide-solid';
import { createJobFormSchema, type JobFormInput } from '@/features/job/ui/schemas/forms.schema.ts';
import { zodForm } from '@/shared/ui/forms/zod-form';
import { jobTypeOptions, workplaceOptions, compensationUnitOptions, type CompensationUnit } from '../options/job-options';

function NewJob() {
  const { t, locale } = useI18n();
  const schema = createJobFormSchema(locale());
  const [organizations, setOrganizations] = createSignal<MyOrganization[]>([]);
  const [_form, { Form, Field: FormField }] = createForm<JobFormInput>({
    initialValues: {
      title: '',
      description: '',
      employmentType: 'full_time',
      workplaceType: 'remote',
      location: null,
      compensationMin: '',
      compensationMax: '',
      compensationCurrency: 'USD',
      compensationUnit: 'yearly',
      applicationUrl: '',
      publisherOrganizationId: '',
      tagSlugs: [],
    },
    validate: zodForm(schema),
    validateOn: 'submit',
    revalidateOn: 'input',
  });
  const workplaceType = () => getValue(_form, 'workplaceType') ?? 'remote';
  const location = () => getValue(_form, 'location') ?? '';
  const publisherOrganizationId = () => getValue(_form, 'publisherOrganizationId') ?? '';

  onMount(async () => {
    const items = await listMyOrganizations();
    setOrganizations(
      items.filter(
        (organization) =>
          organization.status === 'active' &&
          (organization.membershipRole === 'owner' || organization.membershipRole === 'admin'),
      ),
    );
  });

  const submit = async (values: JobFormInput) => {
    try {
      const organizationId = values.publisherOrganizationId?.trim() ?? '';
      const numberValue = (value: string | number | null | undefined) => value === '' || value === null || value === undefined ? null : Number(value);
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        employmentType: values.employmentType,
        workplaceType: values.workplaceType,
        location: values.location?.trim() || null,
        compensationMin: numberValue(values.compensationMin),
        compensationMax: numberValue(values.compensationMax),
        compensationCurrency: values.compensationCurrency?.trim().toUpperCase() || null,
        compensationUnit: values.compensationUnit ?? null,
        applicationUrl: values.applicationUrl.trim(),
        tagSlugs: values.tagSlugs,
      };
      const result = organizationId
        ? await createJob({ ...payload, publisherOrganizationId: organizationId })
        : await submitJob(payload);
      if (result.error) {
        setResponse(_form, { status: 'error', message: t('newjob.couldNotPublishOpportunity') });
        return;
      }
      redirectTo(organizationId ? routes.jobs : routes.account.jobSuggestions);
    } catch {
      setResponse(_form, { status: 'error', message: t('newjob.couldNotPublishOpportunity') });
    }
  };

  return (
    <Form onSubmit={submit} class="space-y-8 rounded-3xl border border-line bg-surface-elevated p-6">
      <Show when={organizations().length > 0}>
        <Field>
          <label for="job-publisher" class="field-label">{t('newjob.publisher')}</label>
          <Select<string>
            id="job-publisher"
            value={publisherOrganizationId()}
            ariaLabel={t('newjob.publisher')}
            options={[
              { value: '', label: t('newjob.communitySuggestion') },
              ...organizations().map((organization) => ({ value: organization.id, label: organization.name })),
            ]}
            onChange={(value) => setValue(_form, 'publisherOrganizationId', value)}
          />
          <p class="text-caption">
            {publisherOrganizationId() ? t('newjob.directOrganizationPublish') : t('newjob.communityReviewFlow')}
          </p>
        </Field>
      </Show>

      <fieldset class="space-y-4">
        <legend class="mb-4 text-sm font-semibold text-content">{t('editjob.opportunity')}</legend>
        <Field>
          <label for="job-title" class="field-label">{t('editjob.title')}</label>
          <FormField name="title">
            {(field, props) => <><input {...props} id="job-title" maxlength={180} placeholder={t('newjob.exDeveloperBackendTypescript')}  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}
          </FormField>
        </Field>
        <div class="grid gap-4 sm:grid-cols-2">
          <FormField name="employmentType">
            {(field) => <><Select<JobFormInput['employmentType']> id="job-type" label={t('editjob.typeHiring')} value={field.value ?? 'full_time'} options={jobTypeOptions(t)} onChange={(value) => setValue(_form, 'employmentType', value)} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}
          </FormField>
          <FormField name="workplaceType">
            {(field) => <><Select<JobFormInput['workplaceType']> id="job-workplace" label={t('editjob.model')} value={field.value ?? 'remote'} options={workplaceOptions(t)} onChange={(value) => { setValue(_form, 'workplaceType', value); setValue(_form, 'location', value === 'remote' ? null : location()); }} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}
          </FormField>
        </div>
        <Field>
          <label for="job-description" class="field-label">{t('editjob.description')}</label>
          <FormField name="description">
            {(field, props) => <><textarea {...props} id="job-description" minlength={20} maxlength={20000} rows={8} placeholder={t('newjob.responsibilitiesRequirementsContextConditionsRelevant')}  class="field-control resize-y"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}
          </FormField>
        </Field>
        <FormField name="tagSlugs" type="string[]">
          {(field) => <><TagSelector id="job-tags" value={field.value ?? []} onChange={(value) => setValue(_form, 'tagSlugs', value)} max={5} label={t('editjob.tags')} placeholder={t('newjob.typescriptBackend')} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}
        </FormField>
      </fieldset>

      <Show when={workplaceType() !== 'remote'}>
        <Field>
          <label for="job-location" class="field-label">{t('editjob.location')}</label>
          <FormField name="location">
            {(field, props) => <><input {...props} id="job-location" value={field.value ?? ''} onInput={(event) => setValue(_form, 'location', event.currentTarget.value)} placeholder={t('newjob.cityRegionOrCountry')}  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}
          </FormField>
        </Field>
      </Show>

      <fieldset class="space-y-4">
        <legend class="mb-4 text-sm font-semibold text-content">{t('editjob.compensation')}</legend>
        <div class="grid gap-4 sm:grid-cols-3">
          <Field><label for="job-comp-min" class="field-label">{t('editjob.minimum')}</label><FormField name="compensationMin" type="string">{(field, props) => <><input {...props} id="job-comp-min" type="number" min="0.01" step="0.01" placeholder="50000"  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField></Field>
          <Field><label for="job-comp-max" class="field-label">{t('editjob.maximum')} <span class="normal-case tracking-normal">{t('editjob.optional')}</span></label><FormField name="compensationMax" type="string">{(field, props) => <><input {...props} id="job-comp-max" type="number" min="0.01" step="0.01" placeholder="80000"  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField></Field>
          <Field><label for="job-currency" class="field-label">{t('editjob.currency')}</label><FormField name="compensationCurrency">{(field, props) => <><input {...props} id="job-currency" maxlength={3} value={field.value ?? ''} onInput={(event) => setValue(_form, 'compensationCurrency', event.currentTarget.value.toUpperCase())} placeholder={t('newjob.usd')}  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField></Field>
        </div>
        <FormField name="compensationUnit">{(field) => <><Select<CompensationUnit> id="job-compensation-unit" label={t('editjob.unit')} value={field.value ?? 'yearly'} options={compensationUnitOptions(t)} onChange={(value) => setValue(_form, 'compensationUnit', value)} /><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
        <p class="text-caption">{t('newjob.enterUnitExactlyHowCompensationWasAnnouncedDevhubNotConverts')}</p>
      </fieldset>

      <fieldset class="space-y-4">
        <legend class="mb-4 text-sm font-semibold text-content">{t('newjob.application')}</legend>
        <Field>
          <label for="job-application-url" class="field-label">{t('newjob.urlApplicationOrContact')}</label>
          <FormField name="applicationUrl">{(field, props) => <><input {...props} id="job-application-url" type="url" placeholder="https://..."  class="field-control"/><Show when={field.error}>{(message) => <span role="alert" class="field-error">{message()}</span>}</Show></>}</FormField>
        </Field>
        <p class="text-caption">{t('newjob.freelanceExpiresUpTo14DaysOtherOpportunitiesUpTo30Days')}</p>
      </fieldset>

      <Show when={_form.response.status === 'error'}>
        <p role="alert" class="text-danger">{_form.response.message}</p>
      </Show>
      <button disabled={_form.submitting} aria-busy={_form.submitting} class="action action-primary">
        <Send class="size-4" />
        {_form.submitting
          ? t('job.publishing')
          : publisherOrganizationId()
            ? t('newjob.publishOpportunity')
            : t('newjob.sendSuggestion')}
      </button>
    </Form>
  );
}

export default withLocale(NewJob);
